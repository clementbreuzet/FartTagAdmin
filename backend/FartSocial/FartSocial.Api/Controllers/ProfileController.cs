using System.Security.Claims;
using FartSocial.Application.Notifications.Dtos;
using FartSocial.Application.Progression;
using FartSocial.Application.Social.Dtos;
using FartSocial.Domain.Economy;
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
public sealed class ProfileController(FartSocialDbContext dbContext, IProgressionService progressionService) : ControllerBase
{
    /// <summary>Gets the authenticated player's V0 profile.</summary>
    [HttpGet]
    public async Task<ActionResult<PlayerProfileDto>> Get([FromQuery] string? rankingScope, CancellationToken cancellationToken)
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
        var progression = progressionService.GetSnapshot(user.TotalXp);
        var flatulons = await GetFlatulonsAsync(user.Id, cancellationToken);
        var bestScore = totalFarts == 0 ? 0 : events.Max(item => item.OfficialScore);
        var averageScore = totalFarts == 0 ? 0 : Math.Round((decimal)events.Average(item => item.OfficialScore), 1);
        var totalDurationMs = events.Sum(item => item.DurationMs);
        var totalGasLevel = events.Sum(item => item.GasLevel);
        var rankings = await GetRankingsAsync(
            user.Id,
            NormalizeRankingScope(rankingScope),
            totalFarts,
            bestScore,
            averageScore,
            totalDurationMs,
            totalGasLevel,
            cancellationToken);

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
            progression.Level,
            progression.TotalXp,
            progression.CurrentLevelXp,
            progression.RequiredLevelXp,
            progression.ProgressPercent,
            flatulons,
            user.Gems,
            new PlayerProfileLocationDto(user.Continent, user.Country, user.City),
            new PlayerProfileStatsDto(totalFarts, bestScore, averageScore, totalDurationMs, totalGasLevel),
            rankings,
            Map(notificationPreference, activePushToken is not null),
            device));
    }

    private async Task<PlayerProfileRankingsDto> GetRankingsAsync(
        Guid userId,
        string scope,
        int totalFarts,
        int bestScore,
        decimal averageScore,
        int totalDurationMs,
        decimal totalGasLevel,
        CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.AsNoTracking().FirstAsync(item => item.Id == userId, cancellationToken);
        var scopedUsers = dbContext.Users.AsNoTracking().Where(item => item.IsActive);
        scopedUsers = scope switch
        {
            "continent" => scopedUsers.Where(item => item.Continent == user.Continent),
            "country" => scopedUsers.Where(item => item.Country == user.Country),
            "city" => scopedUsers.Where(item => item.City == user.City),
            _ => scopedUsers,
        };

        var scopedUserIds = scopedUsers.Select(item => item.Id);
        var userCount = await scopedUsers.CountAsync(cancellationToken);
        var aggregates = await dbContext.FartEvents.AsNoTracking()
            .Where(item => scopedUserIds.Contains(item.UserId))
            .GroupBy(item => item.UserId)
            .Select(group => new PlayerRankingAggregate(
                group.Key,
                group.Count(),
                group.Max(item => item.OfficialScore),
                group.Average(item => (decimal)item.OfficialScore),
                group.Sum(item => item.DurationMs),
                group.Sum(item => item.GasLevel)))
            .ToListAsync(cancellationToken);

        return new PlayerProfileRankingsDto(
            scope,
            userCount,
            Rank(aggregates, item => item.TotalFarts, totalFarts),
            Rank(aggregates, item => item.BestScore, bestScore),
            Rank(aggregates, item => item.AverageScore, averageScore),
            Rank(aggregates, item => item.TotalDurationMs, totalDurationMs),
            Rank(aggregates, item => item.TotalGasLevel, totalGasLevel));
    }

    private static string NormalizeRankingScope(string? scope) =>
        scope?.Trim().ToLowerInvariant() switch
        {
            "continent" => "continent",
            "country" => "country",
            "city" => "city",
            _ => "world",
        };

    private static int Rank<T>(IReadOnlyCollection<PlayerRankingAggregate> aggregates, Func<PlayerRankingAggregate, T> selector, T value)
        where T : IComparable<T> =>
        1 + aggregates.Count(item => selector(item).CompareTo(value) > 0);

    private async Task<int> GetFlatulonsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var wallet = await dbContext.Wallets.FirstOrDefaultAsync(item => item.UserId == userId, cancellationToken);
        if (wallet is null)
        {
            wallet = new Wallet
            {
                Currency = "FLATULONS",
                UserId = userId,
            };
            dbContext.Wallets.Add(wallet);
            await dbContext.SaveChangesAsync(cancellationToken);
            return 0;
        }

        var balance = await dbContext.WalletTransactions
            .Where(transaction => transaction.WalletId == wallet.Id)
            .SumAsync(
                transaction => transaction.Type == WalletTransactionType.Credit ? transaction.Amount : -transaction.Amount,
                cancellationToken);

        return (int)Math.Floor(balance);
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

    private sealed record PlayerRankingAggregate(
        Guid UserId,
        int TotalFarts,
        int BestScore,
        decimal AverageScore,
        int TotalDurationMs,
        decimal TotalGasLevel);
}
