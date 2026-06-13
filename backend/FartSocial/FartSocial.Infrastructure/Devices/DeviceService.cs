using FartSocial.Application.Devices;
using FartSocial.Application.Devices.Dtos;
using FartSocial.Domain.Devices;
using FartSocial.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FartSocial.Infrastructure.Devices;

public sealed class DeviceService(FartSocialDbContext dbContext) : IDeviceService
{
    public async Task<DeviceDto> RegisterAsync(Guid userId, RegisterDeviceRequestDto request, CancellationToken cancellationToken)
    {
        var serialNumber = request.SerialNumber.Trim();
        var existingDevice = await dbContext.Devices.FirstOrDefaultAsync(x => x.SerialNumber == serialNumber, cancellationToken);

        if (existingDevice is null)
        {
            existingDevice = new Device
            {
                BleMacAddress = request.BleMacAddress?.Trim(),
                FirmwareVersion = request.FirmwareVersion?.Trim(),
                Model = request.Model.Trim(),
                Name = request.Name.Trim(),
                SerialNumber = serialNumber,
            };
            dbContext.Devices.Add(existingDevice);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        var activeOwner = await dbContext.DeviceOwnerships
            .Where(x => x.DeviceId == existingDevice.Id && x.IsActive)
            .FirstOrDefaultAsync(cancellationToken);

        if (activeOwner is not null && activeOwner.UserId != userId)
        {
            throw new InvalidOperationException("Ce device a déjà un owner actif.");
        }

        if (activeOwner is null)
        {
            dbContext.DeviceOwnerships.Add(new DeviceOwnership
            {
                DeviceId = existingDevice.Id,
                UserId = userId,
                AssignedAt = DateTimeOffset.UtcNow,
                IsActive = true,
            });
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return await MapDeviceAsync(existingDevice.Id, cancellationToken)
            ?? throw new InvalidOperationException("Le device n'a pas pu être enregistré.");
    }

    public async Task<IReadOnlyCollection<DeviceDto>> GetMyDevicesAsync(Guid userId, CancellationToken cancellationToken)
    {
        var deviceIds = await dbContext.DeviceOwnerships
            .Where(x => x.UserId == userId && x.IsActive)
            .Select(x => x.DeviceId)
            .Distinct()
            .ToListAsync(cancellationToken);

        return await MapDevicesAsync(deviceIds, cancellationToken);
    }

    public async Task<DeviceDto?> GetForUserAsync(Guid userId, Guid deviceId, CancellationToken cancellationToken)
    {
        var hasAccess = await dbContext.DeviceOwnerships.AnyAsync(
            x => x.DeviceId == deviceId && x.UserId == userId && x.IsActive,
            cancellationToken);

        return hasAccess ? await MapDeviceAsync(deviceId, cancellationToken) : null;
    }

    public async Task<IReadOnlyCollection<DeviceDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var ids = await dbContext.Devices.Select(x => x.Id).ToListAsync(cancellationToken);
        return await MapDevicesAsync(ids, cancellationToken);
    }

    public async Task<DeviceDto?> GetByIdAsync(Guid deviceId, CancellationToken cancellationToken)
    {
        return await MapDeviceAsync(deviceId, cancellationToken);
    }

    public async Task<DeviceCalibrationDto?> CreateCalibrationAsync(Guid adminUserId, Guid deviceId, CreateDeviceCalibrationRequestDto request, CancellationToken cancellationToken)
    {
        var deviceExists = await dbContext.Devices.AnyAsync(x => x.Id == deviceId, cancellationToken);
        if (!deviceExists)
        {
            return null;
        }

        var calibration = new DeviceCalibration
        {
            AudioOffsetDb = request.AudioOffsetDb,
            CalibratedAt = DateTimeOffset.UtcNow,
            CalibratedByUserId = adminUserId,
            DeviceId = deviceId,
            GasOffsetKohm = request.GasOffsetKohm,
            Notes = request.Notes?.Trim(),
        };

        dbContext.DeviceCalibrations.Add(calibration);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new DeviceCalibrationDto(
            calibration.Id,
            calibration.DeviceId,
            calibration.CalibratedByUserId,
            calibration.AudioOffsetDb,
            calibration.GasOffsetKohm,
            calibration.Notes,
            calibration.CalibratedAt);
    }

    public async Task<IReadOnlyCollection<DeviceCalibrationDto>> GetCalibrationsAsync(Guid deviceId, CancellationToken cancellationToken)
    {
        return await dbContext.DeviceCalibrations
            .Where(x => x.DeviceId == deviceId)
            .OrderByDescending(x => x.CalibratedAt)
            .Select(x => new DeviceCalibrationDto(
                x.Id,
                x.DeviceId,
                x.CalibratedByUserId,
                x.AudioOffsetDb,
                x.GasOffsetKohm,
                x.Notes,
                x.CalibratedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<DeviceLogDto>> GetLogsAsync(Guid deviceId, CancellationToken cancellationToken)
    {
        return await dbContext.DeviceLogs
            .Where(x => x.DeviceId == deviceId)
            .OrderByDescending(x => x.LoggedAt)
            .Select(x => new DeviceLogDto(
                x.Id,
                x.DeviceId,
                x.Level,
                x.Category,
                x.Message,
                x.Payload,
                x.LoggedAt))
            .ToListAsync(cancellationToken);
    }

    private async Task<IReadOnlyCollection<DeviceDto>> MapDevicesAsync(IEnumerable<Guid> deviceIds, CancellationToken cancellationToken)
    {
        var ids = deviceIds.Distinct().ToArray();
        if (ids.Length == 0)
        {
            return Array.Empty<DeviceDto>();
        }

        return await dbContext.Devices
            .Where(device => ids.Contains(device.Id))
            .Select(device => new DeviceDto(
                device.Id,
                device.SerialNumber,
                device.Name,
                device.Model,
                device.FirmwareVersion,
                device.BleMacAddress,
                device.IsActive,
                dbContext.DeviceOwnerships
                    .Where(ownership => ownership.DeviceId == device.Id && ownership.IsActive)
                    .Select(ownership => (Guid?)ownership.UserId)
                    .FirstOrDefault(),
                dbContext.DeviceOwnerships
                    .Where(ownership => ownership.DeviceId == device.Id && ownership.IsActive)
                    .Join(dbContext.Users, ownership => ownership.UserId, user => user.Id, (_, user) => user.UserName)
                    .FirstOrDefault(),
                device.CreatedAt,
                dbContext.DeviceCalibrations
                    .Where(calibration => calibration.DeviceId == device.Id)
                    .Max(calibration => (DateTimeOffset?)calibration.CalibratedAt)))
            .ToListAsync(cancellationToken);
    }

    private async Task<DeviceDto?> MapDeviceAsync(Guid deviceId, CancellationToken cancellationToken)
    {
        return await dbContext.Devices
            .Where(device => device.Id == deviceId)
            .Select(device => new DeviceDto(
                device.Id,
                device.SerialNumber,
                device.Name,
                device.Model,
                device.FirmwareVersion,
                device.BleMacAddress,
                device.IsActive,
                dbContext.DeviceOwnerships
                    .Where(ownership => ownership.DeviceId == device.Id && ownership.IsActive)
                    .Select(ownership => (Guid?)ownership.UserId)
                    .FirstOrDefault(),
                dbContext.DeviceOwnerships
                    .Where(ownership => ownership.DeviceId == device.Id && ownership.IsActive)
                    .Join(dbContext.Users, ownership => ownership.UserId, user => user.Id, (_, user) => user.UserName)
                    .FirstOrDefault(),
                device.CreatedAt,
                dbContext.DeviceCalibrations
                    .Where(calibration => calibration.DeviceId == device.Id)
                    .Max(calibration => (DateTimeOffset?)calibration.CalibratedAt)))
            .FirstOrDefaultAsync(cancellationToken);
    }
}
