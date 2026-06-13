namespace FartSocial.Application.Devices.Dtos;

public sealed record DeviceLogDto(
    Guid Id,
    Guid DeviceId,
    string Level,
    string Category,
    string Message,
    string? Payload,
    DateTimeOffset LoggedAt);
