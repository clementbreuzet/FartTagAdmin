namespace FartSocial.Application.Inventory.Dtos;

public sealed record InventoryItemDto(
    Guid UserInventoryItemId,
    Guid InventoryItemId,
    string Name,
    string Category,
    string Rarity,
    string? AssetKey,
    string? Description,
    bool IsTradable,
    bool IsEquipped,
    DateTimeOffset AcquiredAt,
    bool IsDuplicate,
    int? DuplicateCompensationFlatulons,
    Guid LootBoxRewardId);
