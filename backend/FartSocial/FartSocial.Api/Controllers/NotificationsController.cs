using System.Security.Claims;
using FartSocial.Application.Notifications.Dtos;
using FartSocial.Domain.Notifications;
using FartSocial.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FartSocial.Api.Controllers;

/// <summary>Manages push tokens and notification preferences for the authenticated user.</summary>
[ApiController]
[Authorize]
[Route("api/notifications")]
public sealed class NotificationsController(FartSocialDbContext dbContext) : ControllerBase
{
    /// <summary>Registers or refreshes an Expo push token.</summary>
    [HttpPost("register-token")]
    public async Task<IActionResult> RegisterToken(RegisterPushTokenRequestDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        if (string.IsNullOrWhiteSpace(request.Token) || request.Platform is not ("android" or "ios"))
        {
            return BadRequest("Le token et la plateforme sont invalides.");
        }

        var token = request.Token.Trim();
        var existing = await dbContext.UserPushTokens.FirstOrDefaultAsync(item => item.Token == token, cancellationToken);
        if (existing is null)
        {
            dbContext.UserPushTokens.Add(new UserPushToken
            {
                DeviceName = request.DeviceName?.Trim(),
                LastSeenAt = DateTimeOffset.UtcNow,
                Platform = request.Platform,
                Token = token,
                UserId = userId.Value,
            });
        }
        else
        {
            existing.DeviceName = request.DeviceName?.Trim();
            existing.LastSeenAt = DateTimeOffset.UtcNow;
            existing.Platform = request.Platform;
            existing.RevokedAt = null;
            existing.UserId = userId.Value;
            existing.UpdatedAt = DateTimeOffset.UtcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    /// <summary>Revokes an Expo push token owned by the authenticated user.</summary>
    [HttpDelete("register-token")]
    public async Task<IActionResult> RevokeToken(RevokePushTokenRequestDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        var token = await dbContext.UserPushTokens.FirstOrDefaultAsync(
            item => item.UserId == userId.Value && item.Token == request.Token,
            cancellationToken);
        if (token is null) return NoContent();
        token.RevokedAt = DateTimeOffset.UtcNow;
        token.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    /// <summary>Gets notification preferences for the authenticated user.</summary>
    [HttpGet("preferences")]
    public async Task<ActionResult<NotificationPreferenceDto>> GetPreferences(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        var preference = await dbContext.NotificationPreferences.AsNoTracking()
            .FirstOrDefaultAsync(item => item.UserId == userId.Value, cancellationToken);
        return Ok(Map(preference ?? new NotificationPreference { UserId = userId.Value }));
    }

    /// <summary>Updates notification preferences for the authenticated user.</summary>
    [HttpPut("preferences")]
    public async Task<ActionResult<NotificationPreferenceDto>> UpdatePreferences(
        NotificationPreferenceDto request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        var preference = await dbContext.NotificationPreferences
            .FirstOrDefaultAsync(item => item.UserId == userId.Value, cancellationToken);
        if (preference is null)
        {
            preference = new NotificationPreference { UserId = userId.Value };
            dbContext.NotificationPreferences.Add(preference);
        }
        preference.SocialEnabled = request.SocialEnabled;
        preference.RewardsEnabled = request.RewardsEnabled;
        preference.ChallengesEnabled = request.ChallengesEnabled;
        preference.DailyReminderEnabled = request.DailyReminderEnabled;
        preference.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(Map(preference));
    }

    private Guid? GetUserId()
    {
        var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(rawUserId, out var userId) ? userId : null;
    }

    private static NotificationPreferenceDto Map(NotificationPreference preference) =>
        new(preference.SocialEnabled, preference.RewardsEnabled, preference.ChallengesEnabled, preference.DailyReminderEnabled);
}
