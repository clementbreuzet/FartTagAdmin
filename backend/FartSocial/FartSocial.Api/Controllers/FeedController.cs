using System.Security.Claims;
using FartSocial.Application.Social;
using FartSocial.Application.Social.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FartSocial.Api.Controllers;

/// <summary>
/// Provides the public social feed for the authenticated user.
/// </summary>
/// <param name="socialService">The social service.</param>
[ApiController]
[Authorize]
[Route("api/feed")]
public sealed class FeedController(ISocialService socialService) : ControllerBase
{
    /// <summary>Gets recent public fart events with reactions.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<FeedItemDto>>> GetFeed(CancellationToken cancellationToken)
    {
        return await GetPublicFeed(cancellationToken);
    }

    /// <summary>Gets the V0 public feed.</summary>
    [HttpGet("public")]
    public async Task<ActionResult<IReadOnlyCollection<FeedItemDto>>> GetPublicFeed(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var feed = await socialService.GetFeedAsync(userId.Value, cancellationToken);
        return Ok(feed);
    }

    private Guid? GetUserId()
    {
        var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(rawUserId, out var userId) ? userId : null;
    }
}
