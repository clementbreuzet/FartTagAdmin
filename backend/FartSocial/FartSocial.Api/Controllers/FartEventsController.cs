using System.Security.Claims;
using FartSocial.Application.FartEvents;
using FartSocial.Application.FartEvents.Dtos;
using FartSocial.Application.Social.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FartSocial.Api.Controllers;

/// <summary>
/// Creates and manages detected fart events for the authenticated user.
/// </summary>
/// <param name="fartEventService">The fart event command service.</param>
/// <param name="fartEventReadService">The fart event query service.</param>
[ApiController]
[Authorize]
[Route("api/fart-events")]
public sealed class FartEventsController(
    IFartEventService fartEventService,
    IFartEventReadService fartEventReadService) : ControllerBase
{
    /// <summary>Creates a fart event and returns the backend-calculated official result.</summary>
    [HttpPost]
    public async Task<ActionResult<FartEventDto>> Create([FromBody] CreateFartEventRequestDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var response = await fartEventService.CreateAsync(userId.Value, request, cancellationToken);
        return Ok(response);
    }

    /// <summary>Gets the authenticated user's fart event history.</summary>
    [HttpGet("my-history")]
    public async Task<ActionResult<IReadOnlyCollection<FartHistoryItemDto>>> GetMyHistory(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var history = await fartEventReadService.GetMyHistoryAsync(userId.Value, cancellationToken);
        return Ok(history);
    }

    /// <summary>Gets an accessible fart event by its identifier.</summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FartEventDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var fartEvent = await fartEventReadService.GetByIdAsync(userId.Value, id, cancellationToken);
        return fartEvent is null ? NotFound() : Ok(fartEvent);
    }

    /// <summary>Updates the public visibility of an owned fart event.</summary>
    [HttpPost("{id:guid}/visibility")]
    public async Task<ActionResult<FartEventDto>> UpdateVisibility(
        Guid id,
        [FromBody] UpdateFartVisibilityRequestDto request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var fartEvent = await fartEventService.UpdateVisibilityAsync(userId.Value, id, request, cancellationToken);
        return fartEvent is null ? NotFound() : Ok(fartEvent);
    }

    /// <summary>Adds or replaces the authenticated user's reaction to a fart event.</summary>
    [HttpPost("{id:guid}/react")]
    public async Task<ActionResult<FartEventDto>> React(
        Guid id,
        [FromBody] ReactToFartRequestDto request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var fartEvent = await fartEventService.ReactAsync(userId.Value, id, request, cancellationToken);
        return fartEvent is null ? NotFound() : Ok(fartEvent);
    }

    /// <summary>Adds a comment to an accessible fart event.</summary>
    [HttpPost("{id:guid}/comments")]
    public async Task<ActionResult<CommentDto>> Comment(
        Guid id,
        [FromBody] CreateCommentRequestDto request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var comment = await fartEventService.CommentAsync(userId.Value, id, request, cancellationToken);
        return comment is null ? NotFound() : Ok(comment);
    }

    private Guid? GetUserId()
    {
        var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(rawUserId, out var userId) ? userId : null;
    }
}
