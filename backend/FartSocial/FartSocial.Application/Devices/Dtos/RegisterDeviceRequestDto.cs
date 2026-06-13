namespace FartSocial.Application.Devices.Dtos;

public sealed record RegisterDeviceRequestDto(
    string SerialNumber,
    string Name,
    string Model,
    string? FirmwareVersion,
    string? BleMacAddress);
