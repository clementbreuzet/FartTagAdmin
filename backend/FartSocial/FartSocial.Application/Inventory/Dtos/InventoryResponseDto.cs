namespace FartSocial.Application.Inventory.Dtos;

public sealed record InventoryResponseDto(
    Guid? EquippedTitleInventoryItemId,
    Guid? EquippedProfileFrameInventoryItemId,
    Guid? EquippedDetectionEffectInventoryItemId,
    IReadOnlyCollection<InventoryItemDto> Items);
