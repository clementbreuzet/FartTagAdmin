namespace FartSocial.Application.Devices.Dtos;

public sealed record DeviceDto(
    Guid Id,
    string SerialNumber,
    string Name,
    string Model,
    string? FirmwareVersion,
    string? BleMacAddress,
    bool IsActive,
    Guid? CurrentOwnerUserId,
    string? CurrentOwnerUserName,
    DateTimeOffset RegisteredAt,
    DateTimeOffset? LastCalibrationAt);
