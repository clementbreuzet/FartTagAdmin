using System.Security.Claims;
using FartSocial.Application.Devices;
using FartSocial.Application.Devices.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FartSocial.Api.Controllers;

/// <summary>
/// Manages FartTag devices owned by the authenticated user.
/// </summary>
/// <param name="deviceService">The device management service.</param>
[ApiController]
[Authorize]
[Route("api/devices")]
public sealed class DevicesController(IDeviceService deviceService) : ControllerBase
{
    /// <summary>Registers a FartTag and associates it with the authenticated user.</summary>
    [HttpPost("register")]
    public async Task<ActionResult<DeviceDto>> Register([FromBody] RegisterDeviceRequestDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var device = await deviceService.RegisterAsync(userId.Value, request, cancellationToken);
        return Ok(device);
    }

    /// <summary>Gets devices owned by the authenticated user.</summary>
    [HttpGet("my")]
    public async Task<ActionResult<IReadOnlyCollection<DeviceDto>>> GetMyDevices(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var devices = await deviceService.GetMyDevicesAsync(userId.Value, cancellationToken);
        return Ok(devices);
    }

    /// <summary>Gets an owned device by its identifier.</summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DeviceDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var device = await deviceService.GetForUserAsync(userId.Value, id, cancellationToken);
        return device is null ? NotFound() : Ok(device);
    }

    private Guid? GetUserId()
    {
        var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(rawUserId, out var userId) ? userId : null;
    }
}
