namespace FartSocial.Application.Auth.Dtos;

public sealed record MeResponseDto(
    Guid Id,
    string UserName,
    string Email,
    IReadOnlyCollection<string> Roles,
    IReadOnlyCollection<string> Permissions);
