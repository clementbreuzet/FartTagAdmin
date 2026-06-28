using FartSocial.Application.Progression;
using FartSocial.Application.Progression.Dtos;
using FartSocial.Domain.Economy;
using FartSocial.Domain.FartEvents;
using FartSocial.Domain.Identity;
using FartSocial.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FartSocial.Infrastructure.Progression;

public sealed class ProgressionService(FartSocialDbContext dbContext) : IProgressionService
{
    public FartRewardsDto ApplyFartRewards(User user, FartEvent fartEvent)
    {
        var wallet = GetOrCreateWallet(user.Id);
        var oldFlatulons = GetWalletBalance(wallet.Id);
        var oldLevel = Math.Max(1, user.Level);
        var xpGained = CalculateXpGained(fartEvent.OfficialScore, fartEvent.Category, fartEvent.DurationMs);
        var flatulonsGained = CalculateFlatulonsGained(fartEvent.OfficialScore, fartEvent.Category);

        user.TotalXp += xpGained;
        var snapshot = GetSnapshot(user.TotalXp);
        user.Level = snapshot.Level;
        user.UpdatedAt = DateTimeOffset.UtcNow;

        dbContext.WalletTransactions.Add(new WalletTransaction
        {
            Amount = flatulonsGained,
            CreatedByUserId = user.Id,
            Reason = ProgressionConstants.FartValidationRewardReason,
            ReferenceId = fartEvent.Id.ToString("D"),
            ReferenceType = ProgressionConstants.FartEventReferenceType,
            TransactionAt = DateTimeOffset.UtcNow,
            Type = WalletTransactionType.Credit,
            WalletId = wallet.Id,
        });

        return new FartRewardsDto(
            xpGained,
            flatulonsGained,
            oldLevel,
            snapshot.Level,
            snapshot.Level > oldLevel,
            user.TotalXp,
            snapshot.CurrentLevelXp,
            snapshot.RequiredLevelXp,
            snapshot.ProgressPercent,
            oldFlatulons,
            oldFlatulons + flatulonsGained);
    }

    public ProgressionSnapshotDto GetSnapshot(int totalXp)
    {
        var remainingXp = Math.Max(0, totalXp);
        var level = 1;
        var requiredXp = GetRequiredXpForLevel(level);

        while (remainingXp >= requiredXp)
        {
            remainingXp -= requiredXp;
            level++;
            requiredXp = GetRequiredXpForLevel(level);
        }

        var progressPercent = requiredXp <= 0 ? 0 : (int)Math.Floor(remainingXp * 100m / requiredXp);
        return new ProgressionSnapshotDto(level, Math.Max(0, totalXp), remainingXp, requiredXp, Math.Clamp(progressPercent, 0, 100));
    }

    public int GetRequiredXpForLevel(int level) =>
        (int)Math.Floor(100 * Math.Pow(Math.Max(1, level), 1.45));

    private int CalculateXpGained(int officialScore, string category, int durationMs)
    {
        var categoryRank = GetCategoryRank(category);
        var baseXp = 10 + (int)Math.Floor(officialScore * 0.8m);
        var durationBonus = Math.Min(25, Math.Max(0, durationMs / 1000) * 3);
        var categoryBonus = ProgressionConstants.CategoryXpBonus[categoryRank];
        return Math.Clamp(baseXp + categoryBonus + durationBonus, 10, 250);
    }

    private int CalculateFlatulonsGained(int officialScore, string category)
    {
        var categoryRank = GetCategoryRank(category);
        var categoryBonus = ProgressionConstants.CategoryFlatulonsBonus[categoryRank];
        return Math.Clamp((int)Math.Floor(officialScore * 0.35m) + categoryBonus, 3, 100);
    }

    private static int GetCategoryRank(string category) =>
        ProgressionConstants.CategoryRanks.TryGetValue(category, out var rank) ? rank : 1;

    private Wallet GetOrCreateWallet(Guid userId)
    {
        var wallet = dbContext.Wallets.Local.FirstOrDefault(item => item.UserId == userId)
            ?? dbContext.Wallets.FirstOrDefault(item => item.UserId == userId);
        if (wallet is not null)
        {
            return wallet;
        }

        wallet = new Wallet
        {
            Currency = ProgressionConstants.WalletCurrency,
            UserId = userId,
        };
        dbContext.Wallets.Add(wallet);
        return wallet;
    }

    private int GetWalletBalance(Guid walletId)
    {
        var storedBalance = dbContext.WalletTransactions
            .AsNoTracking()
            .Where(transaction => transaction.WalletId == walletId)
            .Sum(transaction => transaction.Type == WalletTransactionType.Credit ? transaction.Amount : -transaction.Amount);
        var pendingBalance = dbContext.ChangeTracker
            .Entries<WalletTransaction>()
            .Where(entry => entry.Entity.WalletId == walletId && entry.State == EntityState.Added)
            .Sum(entry => entry.Entity.Type == WalletTransactionType.Credit ? entry.Entity.Amount : -entry.Entity.Amount);

        return (int)Math.Floor(storedBalance + pendingBalance);
    }
}
