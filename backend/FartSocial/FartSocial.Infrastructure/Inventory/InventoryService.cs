using FartSocial.Application.Inventory;
using FartSocial.Application.Inventory.Dtos;
using FartSocial.Domain.Identity;
using FartSocial.Domain.LootBoxes;
using FartSocial.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FartSocial.Infrastructure.Inventory;

public sealed class InventoryService(FartSocialDbContext dbContext) : IInventoryService
{
    public async Task<InventoryResponseDto> GetMyInventoryAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await GetUserAsync(userId, cancellationToken);
        if (user is null)
        {
            throw new UnauthorizedAccessException("Utilisateur introuvable.");
        }

        var items = await dbContext.UserInventoryItems
            .AsNoTracking()
            .Where(item => item.UserId == userId)
            .OrderByDescending(item => item.AcquiredAt)
            .Include(item => item.InventoryItem)
            .ToListAsync(cancellationToken);

        var mappedItems = items
            .Select(item => new InventoryItemDto(
                item.Id,
                item.InventoryItemId,
                item.InventoryItem?.Name ?? string.Empty,
                item.InventoryItem?.Category.ToString().ToLowerInvariant() ?? string.Empty,
                item.InventoryItem?.Rarity.ToString().ToLowerInvariant() ?? string.Empty,
                item.InventoryItem?.AssetKey,
                item.InventoryItem?.Description,
                item.InventoryItem?.IsTradable ?? false,
                IsEquipped(item.InventoryItemId, user),
                item.AcquiredAt,
                item.IsDuplicate,
                item.DuplicateCompensationFlatulons,
                item.LootBoxRewardId))
            .ToList();

        return new InventoryResponseDto(
            user.EquippedTitleInventoryItemId,
            user.EquippedProfileFrameInventoryItemId,
            user.EquippedDetectionEffectInventoryItemId,
            mappedItems);
    }

    public async Task<InventoryResponseDto?> EquipAsync(Guid userId, Guid itemId, CancellationToken cancellationToken)
    {
        var user = await GetUserAsync(userId, cancellationToken);
        if (user is null)
        {
            return null;
        }

        var inventoryItem = await dbContext.InventoryItems.FirstOrDefaultAsync(x => x.Id == itemId, cancellationToken);
        if (inventoryItem is null)
        {
            return null;
        }

        var ownsItem = await dbContext.UserInventoryItems.AnyAsync(x => x.UserId == userId && x.InventoryItemId == itemId, cancellationToken);
        if (!ownsItem)
        {
            throw new UnauthorizedAccessException("Vous ne possédez pas cet objet.");
        }

        switch (inventoryItem.Category)
        {
            case InventoryItemCategory.Title:
                user.EquippedTitleInventoryItemId = itemId;
                break;
            case InventoryItemCategory.ProfileFrame:
                user.EquippedProfileFrameInventoryItemId = itemId;
                break;
            case InventoryItemCategory.DetectionEffect:
                user.EquippedDetectionEffectInventoryItemId = itemId;
                break;
            default:
                throw new InvalidOperationException("Cet objet ne peut pas être équipé.");
        }

        user.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetMyInventoryAsync(userId, cancellationToken);
    }

    private async Task<User?> GetUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId && x.IsActive, cancellationToken);
    }

    private static bool IsEquipped(Guid itemId, User user) =>
        user.EquippedTitleInventoryItemId == itemId ||
        user.EquippedProfileFrameInventoryItemId == itemId ||
        user.EquippedDetectionEffectInventoryItemId == itemId;
}
