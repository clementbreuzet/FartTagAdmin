namespace FartSocial.Application.LootBoxes.Dtos;

public sealed record InventoryItemDto(
    Guid Id,
    string Name,
    string Category,
    string Rarity,
    string? AssetKey,
    string? Description,
    bool IsTradable);
