namespace FartSocial.Application.LootBoxes.Dtos;

public sealed record LootBoxRewardDto(
    Guid Id,
    Guid InventoryItemId,
    string InventoryItemName,
    string Category,
    string Rarity,
    decimal Weight,
    int DuplicateCompensationFlatulons);
