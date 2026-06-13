using System.Security.Claims;
using FartSocial.Application.Social;
using FartSocial.Application.Social.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FartSocial.Api.Controllers;

/// <summary>
/// Manages friendships and friend requests for the authenticated user.
/// </summary>
/// <param name="socialService">The social service.</param>
[ApiController]
[Authorize]
[Route("api/friends")]
public sealed class FriendsController(ISocialService socialService) : ControllerBase
{
    /// <summary>Gets the authenticated user's friends.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<FriendDto>>> GetFriends(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var friends = await socialService.GetFriendsAsync(userId.Value, cancellationToken);
        return Ok(friends);
    }

    /// <summary>Gets incoming and outgoing pending friend requests.</summary>
    [HttpGet("requests")]
    public async Task<ActionResult<FriendRequestsResponseDto>> GetRequests(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var requests = await socialService.GetFriendRequestsAsync(userId.Value, cancellationToken);
        return Ok(requests);
    }

    /// <summary>Sends a friend request to another user.</summary>
    [HttpPost("{userId:guid}/request")]
    public async Task<ActionResult<FriendRequestDto>> RequestFriend(Guid userId, CancellationToken cancellationToken)
    {
        var currentUserId = GetUserId();
        if (currentUserId is null)
        {
            return Unauthorized();
        }

        var request = await socialService.RequestFriendAsync(currentUserId.Value, userId, cancellationToken);
        return request is null ? NotFound() : Ok(request);
    }

    /// <summary>Accepts an incoming friend request.</summary>
    [HttpPost("{requestId:guid}/accept")]
    public async Task<ActionResult<FriendRequestDto>> AcceptFriendRequest(Guid requestId, CancellationToken cancellationToken)
    {
        var currentUserId = GetUserId();
        if (currentUserId is null)
        {
            return Unauthorized();
        }

        var request = await socialService.AcceptFriendRequestAsync(currentUserId.Value, requestId, cancellationToken);
        return request is null ? NotFound() : Ok(request);
    }

    /// <summary>Rejects an incoming friend request.</summary>
    [HttpDelete("requests/{requestId:guid}")]
    public async Task<ActionResult<FriendRequestDto>> RejectFriendRequest(Guid requestId, CancellationToken cancellationToken)
    {
        var currentUserId = GetUserId();
        if (currentUserId is null)
        {
            return Unauthorized();
        }

        var request = await socialService.RejectFriendRequestAsync(currentUserId.Value, requestId, cancellationToken);
        return request is null ? NotFound() : Ok(request);
    }

    /// <summary>Removes an existing friendship.</summary>
    [HttpDelete("{userId:guid}")]
    public async Task<IActionResult> DeleteFriend(Guid userId, CancellationToken cancellationToken)
    {
        var currentUserId = GetUserId();
        if (currentUserId is null)
        {
            return Unauthorized();
        }

        var removed = await socialService.DeleteFriendAsync(currentUserId.Value, userId, cancellationToken);
        return removed ? NoContent() : NotFound();
    }

    private Guid? GetUserId()
    {
        var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(rawUserId, out var userId) ? userId : null;
    }
}
