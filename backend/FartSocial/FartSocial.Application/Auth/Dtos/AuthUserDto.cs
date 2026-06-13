namespace FartSocial.Application.Auth.Dtos;

public sealed record AuthUserDto(
    Guid Id,
    string UserName,
    string Email,
    IReadOnlyCollection<string> Roles,
    IReadOnlyCollection<string> Permissions);
