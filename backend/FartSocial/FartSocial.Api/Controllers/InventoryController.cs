using System.Security.Claims;
using FartSocial.Application.Inventory;
using FartSocial.Application.Inventory.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FartSocial.Api.Controllers;

/// <summary>
/// Provides and manages cosmetic inventory owned by the authenticated user.
/// </summary>
/// <param name="inventoryService">The inventory service.</param>
[ApiController]
[Authorize]
[Route("api/inventory")]
public sealed class InventoryController(IInventoryService inventoryService) : ControllerBase
{
    /// <summary>Gets the authenticated user's inventory and equipped items.</summary>
    [HttpGet]
    public async Task<ActionResult<InventoryResponseDto>> GetMyInventory(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var inventory = await inventoryService.GetMyInventoryAsync(userId.Value, cancellationToken);
        return Ok(inventory);
    }

    /// <summary>Equips an owned title, profile frame, or detection effect.</summary>
    [HttpPost("{itemId:guid}/equip")]
    public async Task<ActionResult<InventoryResponseDto>> Equip(Guid itemId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var inventory = await inventoryService.EquipAsync(userId.Value, itemId, cancellationToken);
        return inventory is null ? NotFound() : Ok(inventory);
    }

    private Guid? GetUserId()
    {
        var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(rawUserId, out var userId) ? userId : null;
    }
}
