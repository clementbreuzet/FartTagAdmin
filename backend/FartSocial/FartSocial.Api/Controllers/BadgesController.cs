using System.Security.Claims;
using FartSocial.Application.Badges;
using FartSocial.Application.Badges.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FartSocial.Api.Controllers;

/// <summary>
/// Provides the badge catalog and badges earned by the authenticated user.
/// </summary>
/// <param name="badgeService">The badge service.</param>
[ApiController]
[Authorize]
[Route("api/badges")]
public sealed class BadgesController(IBadgeService badgeService) : ControllerBase
{
    /// <summary>Gets the active badge catalog.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<BadgeDto>>> GetAll(CancellationToken cancellationToken)
    {
        var badges = await badgeService.GetAllAsync(cancellationToken);
        return Ok(badges);
    }

    /// <summary>Gets badges earned by the authenticated user.</summary>
    [HttpGet("me")]
    public async Task<ActionResult<IReadOnlyCollection<UserBadgeDto>>> GetMine(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var badges = await badgeService.GetMyBadgesAsync(userId.Value, cancellationToken);
        return Ok(badges);
    }

    private Guid? GetUserId()
    {
        var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(rawUserId, out var userId) ? userId : null;
    }
}
