using System.Security.Claims;
using FartSocial.Application.Notifications.Dtos;
using FartSocial.Application.Social.Dtos;
using FartSocial.Domain.Notifications;
using FartSocial.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FartSocial.Api.Controllers;

/// <summary>Returns the V0 player profile for the authenticated user.</summary>
[ApiController]
[Authorize]
[Route("api/profile")]
public sealed class ProfileController(FartSocialDbContext dbContext) : ControllerBase
{
    /// <summary>Gets the authenticated player's V0 profile.</summary>
    [HttpGet]
    public async Task<ActionResult<PlayerProfileDto>> Get(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var user = await dbContext.Users.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == userId.Value && item.IsActive, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        var events = await dbContext.FartEvents.AsNoTracking()
            .Where(item => item.UserId == userId.Value)
            .ToListAsync(cancellationToken);

        var totalFarts = events.Count;
        var xp = events.Sum(item => item.OfficialScore);
        var level = Math.Max(1, (xp / 1000) + 1);
        var bestScore = totalFarts == 0 ? 0 : events.Max(item => item.OfficialScore);
        var averageScore = totalFarts == 0 ? 0 : Math.Round((decimal)events.Average(item => item.OfficialScore), 1);
        var totalDurationMs = events.Sum(item => item.DurationMs);
        var totalGasLevel = events.Sum(item => item.GasLevel);

        var notificationPreference = await dbContext.NotificationPreferences.AsNoTracking()
            .FirstOrDefaultAsync(item => item.UserId == userId.Value, cancellationToken);
        var activePushToken = await dbContext.UserPushTokens.AsNoTracking()
            .Where(item => item.UserId == userId.Value && item.RevokedAt == null)
            .OrderByDescending(item => item.LastSeenAt)
            .FirstOrDefaultAsync(cancellationToken);
        var device = await dbContext.DeviceOwnerships.AsNoTracking()
            .Where(item => item.UserId == userId.Value && item.IsActive)
            .OrderByDescending(item => item.AssignedAt)
            .Select(item => new ConnectedDeviceDto(item.DeviceId, item.Device!.Name, item.Device.Model))
            .FirstOrDefaultAsync(cancellationToken);

        return Ok(new PlayerProfileDto(
            user.Id,
            user.UserName,
            user.UserName,
            user.AvatarUrl,
            level,
            xp,
            new PlayerProfileStatsDto(totalFarts, bestScore, averageScore, totalDurationMs, totalGasLevel),
            Map(notificationPreference, activePushToken is not null),
            device));
    }

    private Guid? GetUserId()
    {
        var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(rawUserId, out var userId) ? userId : null;
    }

    private static PlayerNotificationSettingsDto Map(NotificationPreference? preference, bool hasActivePushToken)
    {
        var mapped = preference is null
            ? new NotificationPreferenceDto(true, true, true, true)
            : new NotificationPreferenceDto(
                preference.SocialEnabled,
                preference.RewardsEnabled,
                preference.ChallengesEnabled,
                preference.DailyReminderEnabled);

        return new PlayerNotificationSettingsDto(
            mapped.SocialEnabled,
            mapped.RewardsEnabled,
            mapped.ChallengesEnabled,
            mapped.DailyReminderEnabled,
            hasActivePushToken);
    }
}
