using FartSocial.Application.Devices.Dtos;

namespace FartSocial.Application.Devices;

public interface IDeviceService
{
    Task<DeviceDto> RegisterAsync(Guid userId, RegisterDeviceRequestDto request, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<DeviceDto>> GetMyDevicesAsync(Guid userId, CancellationToken cancellationToken);
    Task<DeviceDto?> GetForUserAsync(Guid userId, Guid deviceId, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<DeviceDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<DeviceDto?> GetByIdAsync(Guid deviceId, CancellationToken cancellationToken);
    Task<DeviceCalibrationDto?> CreateCalibrationAsync(Guid adminUserId, Guid deviceId, CreateDeviceCalibrationRequestDto request, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<DeviceCalibrationDto>> GetCalibrationsAsync(Guid deviceId, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<DeviceLogDto>> GetLogsAsync(Guid deviceId, CancellationToken cancellationToken);
}
