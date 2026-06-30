using System.Security.Claims;
using FartSocial.Application.Leaderboards;
using FartSocial.Application.Leaderboards.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FartSocial.Api.Controllers;

/// <summary>
/// Provides backend-calculated global and friend leaderboards.
/// </summary>
/// <param name="leaderboardService">The leaderboard service.</param>
[ApiController]
[Authorize]
[Route("api/leaderboards")]
public sealed class LeaderboardsController(ILeaderboardService leaderboardService) : ControllerBase
{
    /// <summary>Gets global score, weekly, longest, and toxic leaderboards.</summary>
    [HttpGet("global")]
    public async Task<ActionResult<LeaderboardsResponseDto>> GetGlobal([FromQuery] string? rankingScope, CancellationToken cancellationToken)
    {
        var scope = NormalizeRankingScope(rankingScope);
        if (scope == "world")
        {
            var globalResponse = await leaderboardService.GetGlobalAsync(cancellationToken);
            return Ok(globalResponse);
        }

        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var response = await leaderboardService.GetScopedAsync(userId.Value, scope, cancellationToken);
        return Ok(response);
    }

    /// <summary>Gets leaderboards scoped to the authenticated user and their friends.</summary>
    [HttpGet("friends")]
    public async Task<ActionResult<LeaderboardsResponseDto>> GetFriends(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var response = await leaderboardService.GetFriendsAsync(userId.Value, cancellationToken);
        return Ok(response);
    }

    private Guid? GetUserId()
    {
        var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(rawUserId, out var userId) ? userId : null;
    }

    private static string NormalizeRankingScope(string? scope) =>
        scope?.Trim().ToLowerInvariant() switch
        {
            "continent" => "continent",
            "country" => "country",
            "city" => "city",
            _ => "world",
        };
}
