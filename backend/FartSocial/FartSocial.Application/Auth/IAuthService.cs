using FartSocial.Application.Auth.Dtos;

namespace FartSocial.Application.Auth;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, string? clientIp, CancellationToken cancellationToken);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, string? clientIp, CancellationToken cancellationToken);
    Task<AuthResponseDto> RefreshAsync(RefreshTokenRequestDto request, string? clientIp, CancellationToken cancellationToken);
    Task LogoutAsync(LogoutRequestDto request, string? clientIp, CancellationToken cancellationToken);
    Task<MeResponseDto> GetMeAsync(Guid userId, CancellationToken cancellationToken);
}
