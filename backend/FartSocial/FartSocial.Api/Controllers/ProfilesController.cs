using System.Security.Claims;
using FartSocial.Application.Social;
using FartSocial.Application.Social.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FartSocial.Api.Controllers;

/// <summary>
/// Provides full profile summaries and user discovery for FartTag Social.
/// </summary>
/// <param name="socialService">The social query service.</param>
[ApiController]
[Authorize]
[Route("api/profiles")]
public sealed class ProfilesController(ISocialService socialService) : ControllerBase
{
    /// <summary>Gets the authenticated user's full social profile.</summary>
    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> GetMine(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var profile = await socialService.GetProfileAsync(userId.Value, userId.Value, cancellationToken);
        return profile is null ? NotFound() : Ok(profile);
    }

    /// <summary>Gets a user's public social profile.</summary>
    [HttpGet("{userId:guid}")]
    public async Task<ActionResult<UserProfileDto>> GetById(Guid userId, CancellationToken cancellationToken)
    {
        var viewerUserId = GetUserId();
        if (viewerUserId is null)
        {
            return Unauthorized();
        }

        var profile = await socialService.GetProfileAsync(viewerUserId.Value, userId, cancellationToken);
        return profile is null ? NotFound() : Ok(profile);
    }

    /// <summary>Searches active users by username.</summary>
    [HttpGet("search")]
    public async Task<ActionResult<IReadOnlyCollection<UserSearchResultDto>>> Search(
        [FromQuery] string query,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        return Ok(await socialService.SearchUsersAsync(userId.Value, query, cancellationToken));
    }

    private Guid? GetUserId()
    {
        var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(rawUserId, out var userId) ? userId : null;
    }
}
