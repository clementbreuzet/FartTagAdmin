using System.Text.Json;
using FartSocial.Application.Economy;
using FartSocial.Application.Economy.Dtos;
using FartSocial.Application.LootBoxes;
using FartSocial.Application.LootBoxes.Dtos;
using FartSocial.Domain.Economy;
using FartSocial.Domain.LootBoxes;
using FartSocial.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FartSocial.Infrastructure.LootBoxes;

public sealed class LootBoxService(FartSocialDbContext dbContext, IEconomyService economyService) : ILootBoxService
{
    public async Task<IReadOnlyCollection<LootBoxDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var lootBoxes = await dbContext.LootBoxes
            .AsNoTracking()
            .Where(lootBox => lootBox.IsActive)
            .OrderBy(lootBox => lootBox.PriceFlatulons)
            .ThenBy(lootBox => lootBox.Name)
            .Include(lootBox => lootBox.Rewards)
            .ThenInclude(reward => reward.InventoryItem)
            .ToListAsync(cancellationToken);

        return lootBoxes.Select(MapLootBoxDto).ToList();
    }

    public async Task<OpenLootBoxResultDto?> OpenAsync(Guid userId, Guid lootBoxId, CancellationToken cancellationToken)
    {
        var lootBox = await dbContext.LootBoxes
            .AsNoTracking()
            .Include(currentLootBox => currentLootBox.Rewards)
            .ThenInclude(reward => reward.InventoryItem)
            .FirstOrDefaultAsync(lootBox => lootBox.Id == lootBoxId && lootBox.IsActive, cancellationToken);
        if (lootBox is null)
        {
            return null;
        }

        var rewards = lootBox.Rewards
            .Where(reward => reward.IsActive && reward.InventoryItem is not null)
            .Select(reward => new LootBoxRewardEntry(
                reward.Id,
                reward.InventoryItemId,
                reward.InventoryItem!.Name,
                reward.InventoryItem.Category.ToString().ToLowerInvariant(),
                reward.Rarity.ToString().ToLowerInvariant(),
                reward.Weight,
                reward.DuplicateCompensationFlatulons,
                reward.InventoryItem.AssetKey,
                reward.InventoryItem.Description,
                reward.InventoryItem.IsTradable))
            .ToList();

        var selectedReward = DrawReward(rewards);

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        if (lootBox.PriceFlatulons > 0)
        {
            await economyService.DebitFlatulonsAsync(
                userId,
                new DebitFlatulonsRequestDto(
                    lootBox.PriceFlatulons,
                    $"Ouverture lootbox {lootBox.Name}",
                    "lootbox",
                    lootBox.Id.ToString()),
                actorUserId: null,
                cancellationToken);
        }

        var alreadyOwned = await dbContext.UserInventoryItems.AnyAsync(
            item => item.UserId == userId && item.InventoryItemId == selectedReward.InventoryItemId,
            cancellationToken);

        var acquisition = new UserInventoryItem
        {
            AcquiredAt = DateTimeOffset.UtcNow,
            DuplicateCompensationFlatulons = alreadyOwned ? selectedReward.DuplicateCompensationFlatulons : null,
            InventoryItemId = selectedReward.InventoryItemId,
            IsDuplicate = alreadyOwned,
            LootBoxRewardId = selectedReward.RewardId,
            UserId = userId,
        };

        dbContext.UserInventoryItems.Add(acquisition);

        if (alreadyOwned && selectedReward.DuplicateCompensationFlatulons > 0)
        {
            await economyService.CreditFlatulonsAsync(
                userId,
                new CreditFlatulonsRequestDto(
                    selectedReward.DuplicateCompensationFlatulons,
                    $"Compensation doublon lootbox {lootBox.Name}",
                    "lootbox_duplicate",
                    lootBox.Id.ToString()),
                actorUserId: null,
                cancellationToken);
        }
        else
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);

        var walletBalance = await economyService.GetBalanceAsync(userId, cancellationToken);

        return new OpenLootBoxResultDto(
            lootBox.Id,
            lootBox.Name,
            new InventoryItemDto(
                selectedReward.InventoryItemId,
                selectedReward.InventoryItemName,
                selectedReward.Category,
                selectedReward.Rarity,
                selectedReward.AssetKey,
                selectedReward.Description,
                selectedReward.IsTradable),
            new UserInventoryItemDto(
                acquisition.Id,
                acquisition.InventoryItemId,
                selectedReward.InventoryItemName,
                selectedReward.Category,
                selectedReward.Rarity,
                acquisition.IsDuplicate,
                acquisition.DuplicateCompensationFlatulons,
                acquisition.AcquiredAt),
            acquisition.IsDuplicate,
            acquisition.DuplicateCompensationFlatulons ?? 0,
            walletBalance);
    }

    private static LootBoxDto MapLootBoxDto(LootBox lootBox)
    {
        return new LootBoxDto(
            lootBox.Id,
            lootBox.Name,
            lootBox.Description,
            lootBox.PriceFlatulons,
            lootBox.IsActive,
            lootBox.Rewards
                .Where(reward => reward.IsActive && reward.InventoryItem is not null)
                .OrderByDescending(reward => reward.Weight)
                .Select(reward => new LootBoxRewardDto(
                    reward.Id,
                    reward.InventoryItemId,
                    reward.InventoryItem!.Name,
                    reward.InventoryItem.Category.ToString().ToLowerInvariant(),
                    reward.Rarity.ToString().ToLowerInvariant(),
                    reward.Weight,
                    reward.DuplicateCompensationFlatulons))
                .ToList());
    }

    private static LootBoxRewardEntry DrawReward(IReadOnlyCollection<LootBoxRewardEntry> rewards)
    {
        if (rewards.Count == 0)
        {
            throw new InvalidOperationException("Cette lootbox ne contient aucune récompense active.");
        }

        var totalWeight = rewards.Sum(reward => reward.Weight);
        if (totalWeight <= 0)
        {
            throw new InvalidOperationException("Les probabilités de la lootbox sont invalides.");
        }

        var roll = Random.Shared.NextDouble() * (double)totalWeight;
        double cumulative = 0;
        LootBoxRewardEntry? lastReward = null;

        foreach (var reward in rewards)
        {
            cumulative += (double)reward.Weight;
            lastReward = reward;
            if (roll <= cumulative)
            {
                return reward;
            }
        }

        return lastReward ?? throw new InvalidOperationException("Impossible de sélectionner une récompense.");
    }
}
