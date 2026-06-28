using FartSocial.Application.Authorization;
using FartSocial.Domain.Badges;
using FartSocial.Domain.Identity;
using FartSocial.Domain.Security;
using FartSocial.Infrastructure.Configuration;
using FartSocial.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FartSocial.Infrastructure.Seeding;

public sealed class AuthSeeder(
    FartSocialDbContext dbContext,
    IPasswordHasher<User> passwordHasher,
    IOptions<SeedOptions> seedOptions)
{
    private readonly SeedOptions _seedOptions = seedOptions.Value;

    public async Task SeedAsync(CancellationToken cancellationToken)
    {
        await SeedPermissionsAsync(cancellationToken);
        await SeedRolesAsync(cancellationToken);
        await SeedDefaultSuperAdminAsync(cancellationToken);
    }

    public async Task SeedDevelopmentUserAsync(CancellationToken cancellationToken)
    {
        const string userName = "usb-tester";
        const string email = "usb-tester@farttag.local";
        const string password = "UsbTest!2026";

        var normalizedUserName = userName.ToUpperInvariant();
        var normalizedEmail = email.ToUpperInvariant();
        var userByName = await dbContext.Users.FirstOrDefaultAsync(x => x.NormalizedUserName == normalizedUserName, cancellationToken);
        var userByEmail = await dbContext.Users.FirstOrDefaultAsync(x => x.NormalizedEmail == normalizedEmail, cancellationToken);
        if (userByName is not null && userByEmail is not null && userByName.Id != userByEmail.Id)
        {
            throw new InvalidOperationException("Cannot seed development user because username and email belong to different users.");
        }

        var user = userByName ?? userByEmail;

        if (user is null)
        {
            user = new User
            {
                Email = email,
                NormalizedEmail = normalizedEmail,
                NormalizedUserName = normalizedUserName,
                UserName = userName,
            };
            dbContext.Users.Add(user);
        }
        else
        {
            user.Email = email;
            user.NormalizedEmail = normalizedEmail;
            user.NormalizedUserName = normalizedUserName;
            user.UserName = userName;
            user.IsActive = true;
            user.UpdatedAt = DateTimeOffset.UtcNow;
        }

        user.PasswordHash = passwordHasher.HashPassword(user, password);
        await dbContext.SaveChangesAsync(cancellationToken);

        await AssignRoleAsync(user.Id, "User", cancellationToken);
    }

    private async Task SeedPermissionsAsync(CancellationToken cancellationToken)
    {
        foreach (var permissionName in PermissionCatalog.All)
        {
            var exists = await dbContext.Permissions.AnyAsync(x => x.Name == permissionName, cancellationToken);
            if (exists)
            {
                continue;
            }

            dbContext.Permissions.Add(new Permission
            {
                Description = permissionName,
                Name = permissionName,
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task SeedRolesAsync(CancellationToken cancellationToken)
    {
        var roleDefinitions = new[]
        {
            new { Description = "Utilisateur standard", Name = "User", Permissions = Array.Empty<string>() },
            new { Description = "Support client", Name = "Support", Permissions = new[] { PermissionCatalog.UserSupport, PermissionCatalog.DeviceRead } },
            new { Description = "Développeur interne", Name = "Developer", Permissions = new[] { PermissionCatalog.DeviceRead, PermissionCatalog.DeviceCalibrate, PermissionCatalog.DeviceUpdateFirmware, PermissionCatalog.DeviceViewLogs, PermissionCatalog.ModelManage } },
            new { Description = "Administrateur", Name = "Admin", Permissions = new[] { PermissionCatalog.AdminAccess, PermissionCatalog.DeviceRead, PermissionCatalog.DeviceCalibrate, PermissionCatalog.DeviceUpdateFirmware, PermissionCatalog.DeviceViewLogs, PermissionCatalog.UserSupport, PermissionCatalog.ModelManage, PermissionCatalog.EconomyManage, PermissionCatalog.LootboxManage } },
            new { Description = "Super administrateur", Name = "SuperAdmin", Permissions = PermissionCatalog.All },
        };

        foreach (var roleDefinition in roleDefinitions)
        {
            var role = await dbContext.Roles.FirstOrDefaultAsync(x => x.NormalizedName == roleDefinition.Name.ToUpperInvariant(), cancellationToken);
            if (role is null)
            {
                role = new Role
                {
                    Description = roleDefinition.Description,
                    Name = roleDefinition.Name,
                    NormalizedName = roleDefinition.Name.ToUpperInvariant(),
                };
                dbContext.Roles.Add(role);
                await dbContext.SaveChangesAsync(cancellationToken);
            }

            foreach (var permissionName in roleDefinition.Permissions)
            {
                var permission = await dbContext.Permissions.FirstAsync(x => x.Name == permissionName, cancellationToken);
                var hasGrant = await dbContext.RolePermissions.AnyAsync(x => x.RoleId == role.Id && x.PermissionId == permission.Id, cancellationToken);
                if (hasGrant)
                {
                    continue;
                }

                dbContext.RolePermissions.Add(new RolePermission
                {
                    PermissionId = permission.Id,
                    RoleId = role.Id,
                });
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task SeedBadgesAsync(CancellationToken cancellationToken)
    {
        var badgeDefinitions = new[]
        {
            new { Code = "first-fart", Name = "Premier Fart", Description = "Attribué au premier fart enregistré.", Rarity = BadgeRarity.Common, IconKey = "badge-first-fart" },
            new { Code = "gaz-noble", Name = "Gaz Noble", Description = "Attribué aux farts particulièrement riches en gaz.", Rarity = BadgeRarity.Rare, IconKey = "badge-gaz-noble" },
            new { Code = "category-5", Name = "Catégorie 5", Description = "Attribué aux farts de catégorie mythique.", Rarity = BadgeRarity.Epic, IconKey = "badge-category-5" },
            new { Code = "silent-assassin", Name = "Assassin Silencieux", Description = "Attribué aux farts discrets mais redoutables.", Rarity = BadgeRarity.Legendary, IconKey = "badge-silent-assassin" },
            new { Code = "king-of-farts", Name = "Roi du Fart", Description = "Attribué aux utilisateurs les plus prolifiques.", Rarity = BadgeRarity.Mythic, IconKey = "badge-king-of-farts" },
        };

        foreach (var badgeDefinition in badgeDefinitions)
        {
            var exists = await dbContext.Badges.AnyAsync(x => x.Code == badgeDefinition.Code, cancellationToken);
            if (exists)
            {
                continue;
            }

            dbContext.Badges.Add(new Badge
            {
                Code = badgeDefinition.Code,
                Description = badgeDefinition.Description,
                IconKey = badgeDefinition.IconKey,
                IsActive = true,
                Name = badgeDefinition.Name,
                Rarity = badgeDefinition.Rarity,
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task SeedDefaultSuperAdminAsync(CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_seedOptions.SuperAdminEmail) ||
            string.IsNullOrWhiteSpace(_seedOptions.SuperAdminPassword))
        {
            return;
        }

        var normalizedEmail = _seedOptions.SuperAdminEmail.ToUpperInvariant();
        var existing = await dbContext.Users.FirstOrDefaultAsync(x => x.NormalizedEmail == normalizedEmail, cancellationToken);
        if (existing is not null)
        {
            return;
        }

        var user = new User
        {
            Email = _seedOptions.SuperAdminEmail,
            NormalizedEmail = normalizedEmail,
            NormalizedUserName = string.IsNullOrWhiteSpace(_seedOptions.SuperAdminUserName)
                ? normalizedEmail
                : _seedOptions.SuperAdminUserName.ToUpperInvariant(),
            UserName = string.IsNullOrWhiteSpace(_seedOptions.SuperAdminUserName)
                ? _seedOptions.SuperAdminEmail
                : _seedOptions.SuperAdminUserName,
        };
        user.PasswordHash = passwordHasher.HashPassword(user, _seedOptions.SuperAdminPassword);

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        var superAdminRole = await dbContext.Roles.FirstAsync(x => x.NormalizedName == "SUPERADMIN", cancellationToken);
        dbContext.UserRoles.Add(new UserRole
        {
            RoleId = superAdminRole.Id,
            UserId = user.Id,
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task AssignRoleAsync(Guid userId, string roleName, CancellationToken cancellationToken)
    {
        var role = await dbContext.Roles.FirstAsync(x => x.NormalizedName == roleName.ToUpperInvariant(), cancellationToken);
        var hasRole = await dbContext.UserRoles.AnyAsync(x => x.UserId == userId && x.RoleId == role.Id, cancellationToken);
        if (hasRole)
        {
            return;
        }

        dbContext.UserRoles.Add(new UserRole
        {
            RoleId = role.Id,
            UserId = userId,
        });
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
