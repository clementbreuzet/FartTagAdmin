namespace FartSocial.Application.Notifications.Dtos;

public sealed record RegisterPushTokenRequestDto(
    string Token,
    string Platform,
    string? DeviceName);
