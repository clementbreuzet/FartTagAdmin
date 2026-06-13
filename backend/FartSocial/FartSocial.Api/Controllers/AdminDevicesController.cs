using System.Security.Claims;
using FartSocial.Application.Authorization;
using FartSocial.Application.Devices;
using FartSocial.Application.Devices.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FartSocial.Api.Controllers;

/// <summary>
/// Exposes administrative operations for inspecting and calibrating FartTag devices.
/// </summary>
/// <param name="deviceService">The device management service.</param>
[ApiController]
[Authorize(Policy = PolicyNames.AdminAccess)]
[Route("api/admin/devices")]
public sealed class AdminDevicesController(IDeviceService deviceService) : ControllerBase
{
    /// <summary>Gets every registered device.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<DeviceDto>>> GetAll(CancellationToken cancellationToken)
    {
        var devices = await deviceService.GetAllAsync(cancellationToken);
        return Ok(devices);
    }

    /// <summary>Gets a registered device by its identifier.</summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DeviceDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var device = await deviceService.GetByIdAsync(id, cancellationToken);
        return device is null ? NotFound() : Ok(device);
    }

    /// <summary>Creates and stores a new calibration for a device.</summary>
    [HttpPost("{id:guid}/calibrations")]
    public async Task<ActionResult<DeviceCalibrationDto>> CreateCalibration(
        Guid id,
        [FromBody] CreateDeviceCalibrationRequestDto request,
        CancellationToken cancellationToken)
    {
        var adminUserId = GetUserId();
        if (adminUserId is null)
        {
            return Unauthorized();
        }

        var calibration = await deviceService.CreateCalibrationAsync(adminUserId.Value, id, request, cancellationToken);
        return calibration is null ? NotFound() : Ok(calibration);
    }

    /// <summary>Gets the diagnostic logs recorded for a device.</summary>
    [HttpGet("{id:guid}/logs")]
    public async Task<ActionResult<IReadOnlyCollection<DeviceLogDto>>> GetLogs(Guid id, CancellationToken cancellationToken)
    {
        var logs = await deviceService.GetLogsAsync(id, cancellationToken);
        return Ok(logs);
    }

    private Guid? GetUserId()
    {
        var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(rawUserId, out var userId) ? userId : null;
    }
}
