using FartSocial.Application.Home.Dtos;
using FartSocial.Application.Progression;
using FartSocial.Domain.Daily;
using FartSocial.Domain.Economy;
using FartSocial.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FartSocial.Api.Controllers;

/// <summary>Returns the V0 home dashboard for the authenticated user.</summary>
/// <param name="dbContext">The persistence context used to aggregate home data.</param>
/// <param name="progressionService">Calculates the persisted player progression snapshot.</param>
[ApiController]
[Authorize]
[Route("api/home")]
public sealed class HomeController(FartSocialDbContext dbContext, IProgressionService progressionService) : ControllerBase
{
    /// <summary>Gets the daily dashboard summary.</summary>
    [HttpGet]
    public async Task<ActionResult<HomeDashboardDto>> Get(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var user = await dbContext.Users.AsNoTracking().FirstOrDefaultAsync(item => item.Id == userId.Value && item.IsActive, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        var challenge = await GetOrCreateChallengeAsync(today, cancellationToken);
        var dailyReward = await GetOrCreateDailyRewardAsync(userId.Value, today, cancellationToken);

        var allUserEvents = dbContext.FartEvents.AsNoTracking().Where(item => item.UserId == userId.Value);
        var todayStart = new DateTimeOffset(today.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
        var tomorrowStart = todayStart.AddDays(1);
        var challengeProgress = await allUserEvents.CountAsync(
            item => item.OccurredAt >= todayStart && item.OccurredAt < tomorrowStart,
            cancellationToken);

        var progression = progressionService.GetSnapshot(user.TotalXp);
        var flatulons = await GetFlatulonsAsync(userId.Value, cancellationToken);

        var recentFarts = await allUserEvents
            .OrderByDescending(item => item.OccurredAt)
            .Take(3)
            .Select(item => new HomeFartEventDto(
                item.Id,
                item.OccurredAt,
                item.OfficialScore,
                item.DurationMs,
                item.AudioLevel,
                item.GasLevel,
                item.Category,
                item.IsAuthenticated))
            .ToListAsync(cancellationToken);

        return Ok(new HomeDashboardDto(
            progression.Level,
            progression.TotalXp,
            (int)Math.Floor(flatulons),
            user.Gems,
            new DailyChallengeDto(
                challenge.Id,
                challenge.Title,
                challenge.Description,
                challenge.TargetCount,
                challenge.RewardFlatulons),
            Math.Min(challengeProgress, challenge.TargetCount),
            !dailyReward.IsClaimed,
            recentFarts));
    }

    private async Task<DailyChallenge> GetOrCreateChallengeAsync(DateOnly today, CancellationToken cancellationToken)
    {
        var challenge = await dbContext.DailyChallenges.FirstOrDefaultAsync(
            item => item.ChallengeDate == today,
            cancellationToken);
        if (challenge is not null)
        {
            return challenge;
        }

        challenge = new DailyChallenge
        {
            ChallengeDate = today,
            Description = "Enregistre 3 pets aujourd'hui.",
            IsActive = true,
            RewardFlatulons = 150,
            TargetCount = 3,
            Title = "Trio du jour",
        };
        dbContext.DailyChallenges.Add(challenge);
        await dbContext.SaveChangesAsync(cancellationToken);
        return challenge;
    }

    private async Task<DailyReward> GetOrCreateDailyRewardAsync(Guid userId, DateOnly today, CancellationToken cancellationToken)
    {
        var reward = await dbContext.DailyRewards.FirstOrDefaultAsync(
            item => item.UserId == userId && item.RewardDate == today,
            cancellationToken);
        if (reward is not null)
        {
            return reward;
        }

        reward = new DailyReward
        {
            IsClaimed = false,
            RewardDate = today,
            UserId = userId,
        };
        dbContext.DailyRewards.Add(reward);
        await dbContext.SaveChangesAsync(cancellationToken);
        return reward;
    }

    private async Task<decimal> GetFlatulonsAsync(Guid userId, CancellationToken cancellationToken)
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

        return await dbContext.WalletTransactions
            .Where(transaction => transaction.WalletId == wallet.Id)
            .SumAsync(
                transaction => transaction.Type == WalletTransactionType.Credit ? transaction.Amount : -transaction.Amount,
                cancellationToken);
    }

    private Guid? GetUserId()
    {
        var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(rawUserId, out var userId) ? userId : null;
    }
}
