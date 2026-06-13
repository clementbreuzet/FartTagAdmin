namespace FartSocial.Application.Devices.Dtos;

public sealed record CreateDeviceCalibrationRequestDto(
    decimal AudioOffsetDb,
    decimal GasOffsetKohm,
    string? Notes);
