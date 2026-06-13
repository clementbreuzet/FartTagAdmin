using System.Security.Claims;
using FartSocial.Application.LootBoxes;
using FartSocial.Application.LootBoxes.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FartSocial.Api.Controllers;

/// <summary>
/// Provides loot boxes and performs server-authoritative reward draws.
/// </summary>
/// <param name="lootBoxService">The loot box service.</param>
[ApiController]
[Authorize]
[Route("api/lootboxes")]
public sealed class LootBoxesController(ILootBoxService lootBoxService) : ControllerBase
{
    /// <summary>Gets all active loot boxes and their backend-defined probabilities.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<LootBoxDto>>> GetAll(CancellationToken cancellationToken)
    {
        var lootBoxes = await lootBoxService.GetAllAsync(cancellationToken);
        return Ok(lootBoxes);
    }

    /// <summary>Opens a loot box and returns the server-selected reward.</summary>
    [HttpPost("{id:guid}/open")]
    public async Task<ActionResult<OpenLootBoxResultDto>> Open(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await lootBoxService.OpenAsync(userId.Value, id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    private Guid? GetUserId()
    {
        var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(rawUserId, out var userId) ? userId : null;
    }
}
