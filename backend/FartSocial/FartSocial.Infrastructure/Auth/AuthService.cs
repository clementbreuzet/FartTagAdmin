using System.Security.Claims;
using FartSocial.Application.Auth;
using FartSocial.Application.Auth.Dtos;
using FartSocial.Domain.Identity;
using FartSocial.Infrastructure.Persistence;
using FartSocial.Infrastructure.Security;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FartSocial.Infrastructure.Auth;

public sealed class AuthService(
    FartSocialDbContext dbContext,
    IPasswordHasher<User> passwordHasher,
    JwtTokenService tokenService) : IAuthService
{
    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, string? clientIp, CancellationToken cancellationToken)
    {
        var userNameNormalized = request.UserName.Trim().ToUpperInvariant();
        var emailNormalized = request.Email.Trim().ToUpperInvariant();

        if (await dbContext.Users.AnyAsync(x => x.NormalizedUserName == userNameNormalized, cancellationToken))
        {
            throw new InvalidOperationException("Ce nom d'utilisateur est déjà utilisé.");
        }

        if (await dbContext.Users.AnyAsync(x => x.NormalizedEmail == emailNormalized, cancellationToken))
        {
            throw new InvalidOperationException("Cet email est déjà utilisé.");
        }

        var user = new User
        {
            Email = request.Email.Trim(),
            NormalizedEmail = emailNormalized,
            NormalizedUserName = userNameNormalized,
            UserName = request.UserName.Trim(),
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        await AssignRoleAsync(user.Id, "User", cancellationToken);
        return await BuildAuthResponseAsync(user, clientIp, cancellationToken);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, string? clientIp, CancellationToken cancellationToken)
    {
        var login = request.Login.Trim();
        var normalizedLogin = login.ToUpperInvariant();
        var user = await dbContext.Users.FirstOrDefaultAsync(
            x => x.NormalizedUserName == normalizedLogin || x.NormalizedEmail == normalizedLogin,
            cancellationToken);

        if (user is null || !user.IsActive)
        {
            throw new UnauthorizedAccessException("Identifiants invalides.");
        }

        var verification = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verification == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedAccessException("Identifiants invalides.");
        }

        user.LastLoginAt = DateTimeOffset.UtcNow;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return await BuildAuthResponseAsync(user, clientIp, cancellationToken);
    }

    public async Task<AuthResponseDto> RefreshAsync(RefreshTokenRequestDto request, string? clientIp, CancellationToken cancellationToken)
    {
        var hashedToken = JwtTokenService.HashToken(request.RefreshToken);
        var currentToken = await dbContext.RefreshTokens.FirstOrDefaultAsync(x => x.TokenHash == hashedToken, cancellationToken);
        if (currentToken is null || !currentToken.IsActive)
        {
            throw new UnauthorizedAccessException("Refresh token invalide.");
        }

        var user = await dbContext.Users.FirstAsync(x => x.Id == currentToken.UserId, cancellationToken);
        var response = await BuildAuthResponseAsync(user, clientIp, cancellationToken);

        currentToken.RevokedAt = DateTimeOffset.UtcNow;
        currentToken.RevokedByIp = clientIp;
        currentToken.ReplacedByTokenHash = JwtTokenService.HashToken(response.RefreshToken);
        currentToken.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return response;
    }

    public async Task LogoutAsync(LogoutRequestDto request, string? clientIp, CancellationToken cancellationToken)
    {
        var hashedToken = JwtTokenService.HashToken(request.RefreshToken);
        var currentToken = await dbContext.RefreshTokens.FirstOrDefaultAsync(x => x.TokenHash == hashedToken, cancellationToken);
        if (currentToken is null || !currentToken.IsActive)
        {
            return;
        }

        currentToken.RevokedAt = DateTimeOffset.UtcNow;
        currentToken.RevokedByIp = clientIp;
        currentToken.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<MeResponseDto> GetMeAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId && x.IsActive, cancellationToken)
            ?? throw new UnauthorizedAccessException("Utilisateur introuvable.");

        var roles = await GetUserRolesAsync(user.Id, cancellationToken);
        var permissions = await GetUserPermissionsAsync(user.Id, cancellationToken);

        return new MeResponseDto(user.Id, user.UserName, user.Email, roles, permissions);
    }

    private async Task<AuthResponseDto> BuildAuthResponseAsync(User user, string? clientIp, CancellationToken cancellationToken)
    {
        var roles = await GetUserRolesAsync(user.Id, cancellationToken);
        var permissions = await GetUserPermissionsAsync(user.Id, cancellationToken);
        var issuedTokens = tokenService.IssueTokens(user, roles, permissions);

        var refreshToken = new RefreshToken
        {
            CreatedByIp = clientIp,
            ExpiresAt = issuedTokens.RefreshTokenExpiresAt,
            JwtId = issuedTokens.JwtId,
            TokenHash = issuedTokens.RefreshTokenHash,
            UserId = user.Id,
        };

        dbContext.RefreshTokens.Add(refreshToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new AuthResponseDto(
            issuedTokens.AccessToken,
            issuedTokens.AccessTokenExpiresAt,
            issuedTokens.RefreshToken,
            issuedTokens.RefreshTokenExpiresAt,
            new AuthUserDto(user.Id, user.UserName, user.Email, roles, permissions));
    }

    private async Task AssignRoleAsync(Guid userId, string roleName, CancellationToken cancellationToken)
    {
        var role = await dbContext.Roles.FirstOrDefaultAsync(x => x.NormalizedName == roleName.ToUpperInvariant(), cancellationToken);
        if (role is null)
        {
            return;
        }

        var alreadyAssigned = await dbContext.UserRoles.AnyAsync(x => x.UserId == userId && x.RoleId == role.Id, cancellationToken);
        if (alreadyAssigned)
        {
            return;
        }

        dbContext.UserRoles.Add(new UserRole { RoleId = role.Id, UserId = userId });
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<IReadOnlyCollection<string>> GetUserRolesAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await dbContext.UserRoles
            .Where(x => x.UserId == userId)
            .Join(dbContext.Roles, userRole => userRole.RoleId, role => role.Id, (_, role) => role.Name)
            .Distinct()
            .ToListAsync(cancellationToken);
    }

    private async Task<IReadOnlyCollection<string>> GetUserPermissionsAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await dbContext.UserRoles
            .Where(x => x.UserId == userId)
            .Join(dbContext.Roles, userRole => userRole.RoleId, role => role.Id, (_, role) => role)
            .Join(dbContext.RolePermissions, role => role.Id, rolePermission => rolePermission.RoleId, (_, rolePermission) => rolePermission)
            .Join(dbContext.Permissions, rolePermission => rolePermission.PermissionId, permission => permission.Id, (_, permission) => permission.Name)
            .Distinct()
            .ToListAsync(cancellationToken);
    }
}
