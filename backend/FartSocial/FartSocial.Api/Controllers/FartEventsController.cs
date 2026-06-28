using FartSocial.Application.FartEvents;
using FartSocial.Application.FartEvents.Dtos;
using FartSocial.Application.FartEvents.Requests;
using FartSocial.Application.Social.Dtos;
using FartSocial.Domain.FartEvents;
using FartSocial.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;

namespace FartSocial.Api.Controllers;

/// <summary>
/// Creates and manages detected fart events for the authenticated user.
/// </summary>
/// <param name="fartEventService">The fart event command service.</param>
/// <param name="fartEventReadService">The fart event query service.</param>
/// <param name="dbContext">The persistence context used for audio files.</param>
[ApiController]
[Authorize]
[Route("api/fart-events")]
public sealed class FartEventsController(
    IFartEventService fartEventService,
    IFartEventReadService fartEventReadService,
    FartSocialDbContext dbContext) : ControllerBase
{
    private const long MaxAudioFileSize = 15 * 1024 * 1024;
    private static readonly HashSet<string> AllowedAudioTypes =
    [
        "audio/aac",
        "audio/m4a",
        "audio/mp4",
        "audio/mpeg",
        "audio/wav",
        "audio/x-m4a",
    ];

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

    /// <summary>Uploads a phone microphone recording before creating its fart event.</summary>
    [HttpPost("audio")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxAudioFileSize)]
    public async Task<ActionResult<AudioUploadDto>> UploadAudio(
        [FromForm] UploadAudioRequest uploadAudioRequest,
        CancellationToken cancellationToken)    
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }
        if (uploadAudioRequest.File.Length is <= 0 or > MaxAudioFileSize)
        {
            return BadRequest("Le fichier audio doit peser entre 1 octet et 15 Mo.");
        }
        if (!AllowedAudioTypes.Contains(uploadAudioRequest.File.ContentType.ToLowerInvariant()))
        {
            return BadRequest("Le format audio fourni n'est pas accepté.");
        }
        if (uploadAudioRequest.DurationMs is null or < 1 or > 600_000)
        {
            return BadRequest("La durée audio est invalide.");
        }

        await using var input = uploadAudioRequest.File.OpenReadStream();
        await using var buffer = new MemoryStream((int)uploadAudioRequest.File.Length);
        await input.CopyToAsync(buffer, cancellationToken);
        var blobData = buffer.ToArray();

        var audioFile = new FartAudioFile
        {
            BlobData = blobData,
            ContentType = uploadAudioRequest.File.ContentType,
            DurationMs = uploadAudioRequest.DurationMs.Value,
            FileName = Path.GetFileName(uploadAudioRequest.File.FileName),
            SizeBytes = uploadAudioRequest.File.Length,
            Sha256 = Convert.ToHexString(SHA256.HashData(blobData)).ToLowerInvariant(),
            UserId = userId.Value,
        };
        dbContext.FartAudioFiles.Add(audioFile);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(new AudioUploadDto(audioFile.Id, $"/api/fart-events/audio/{audioFile.Id}"));
    }

    /// <summary>Streams an uploaded recording to its owner or viewers of a public event.</summary>
    [HttpGet("audio/{id:guid}")]
    public async Task<IActionResult> GetAudio(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var audioFile = await dbContext.FartAudioFiles.AsNoTracking().FirstOrDefaultAsync(file => file.Id == id, cancellationToken);
        if (audioFile is null)
        {
            return NotFound();
        }
        var canAccess = audioFile.UserId == userId.Value || await dbContext.FartEvents.AnyAsync(
            fartEvent => fartEvent.AudioFileId == id && fartEvent.Visibility == FartVisibility.Public,
            cancellationToken);
        if (!canAccess)
        {
            return Forbid();
        }

        return audioFile.BlobData is { Length: > 0 }
            ? File(audioFile.BlobData, audioFile.ContentType, enableRangeProcessing: true)
            : NotFound();
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

    /// <summary>Gets comments for an accessible fart event.</summary>
    [HttpGet("{id:guid}/comments")]
    public async Task<ActionResult<IReadOnlyCollection<CommentDto>>> GetComments(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var comments = await fartEventReadService.GetCommentsAsync(userId.Value, id, cancellationToken);
        return comments is null ? NotFound() : Ok(comments);
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
