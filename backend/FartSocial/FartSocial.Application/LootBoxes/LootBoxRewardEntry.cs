namespace FartSocial.Application.LootBoxes;

public sealed record LootBoxRewardEntry(
    Guid RewardId,
    Guid InventoryItemId,
    string InventoryItemName,
    string Category,
    string Rarity,
    decimal Weight,
    int DuplicateCompensationFlatulons,
    string? AssetKey,
    string? Description,
    bool IsTradable);
