namespace FartSocial.Application.Auth.Dtos;

public sealed record RegisterRequestDto(string UserName, string Email, string Password);
