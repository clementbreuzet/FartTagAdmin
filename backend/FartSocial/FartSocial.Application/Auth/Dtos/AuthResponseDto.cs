namespace FartSocial.Application.Auth.Dtos;

public sealed record AuthResponseDto(
    string AccessToken,
    DateTimeOffset AccessTokenExpiresAt,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAt,
    AuthUserDto User);
