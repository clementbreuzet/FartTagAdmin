using System.Security.Claims;
using FartSocial.Application.LootBoxes;
using FartSocial.Application.LootBoxes.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FartSocial.Api.Controllers;

/// <summary>Provides the V0 shop with simple loot boxes.</summary>
/// <param name="lootBoxService">The loot box service.</param>
[ApiController]
[Authorize]
[Route("api/shop")]
public sealed class ShopController(ILootBoxService lootBoxService) : ControllerBase
{
    /// <summary>Gets all active shop loot boxes.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<LootBoxDto>>> Get(CancellationToken cancellationToken)
    {
        return Ok(await lootBoxService.GetAllAsync(cancellationToken));
    }

    /// <summary>Opens a loot box and returns the selected reward.</summary>
    [HttpPost("open")]
    public async Task<ActionResult<OpenLootBoxResultDto>> Open([FromBody] OpenShopLootBoxRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var result = await lootBoxService.OpenAsync(userId.Value, request.LootBoxId, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    private Guid? GetUserId()
    {
        var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(rawUserId, out var userId) ? userId : null;
    }
}

/// <summary>Request body for opening a V0 shop loot box.</summary>
/// <param name="LootBoxId">The loot box identifier to open.</param>
public sealed record OpenShopLootBoxRequest(Guid LootBoxId);
