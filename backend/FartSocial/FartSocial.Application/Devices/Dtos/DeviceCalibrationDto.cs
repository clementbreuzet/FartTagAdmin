namespace FartSocial.Application.Devices.Dtos;

public sealed record DeviceCalibrationDto(
    Guid Id,
    Guid DeviceId,
    Guid CalibratedByUserId,
    decimal AudioOffsetDb,
    decimal GasOffsetKohm,
    string? Notes,
    DateTimeOffset CalibratedAt);
