namespace FartSocial.Application.LootBoxes.Dtos;

public sealed record UserInventoryItemDto(
    Guid Id,
    Guid InventoryItemId,
    string InventoryItemName,
    string Category,
    string Rarity,
    bool IsDuplicate,
    int? DuplicateCompensationFlatulons,
    DateTimeOffset AcquiredAt);
