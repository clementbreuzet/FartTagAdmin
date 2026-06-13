namespace FartSocial.Application.LootBoxes.Dtos;

public sealed record OpenLootBoxResultDto(
    Guid LootBoxId,
    string LootBoxName,
    InventoryItemDto Item,
    UserInventoryItemDto Acquisition,
    bool IsDuplicate,
    int DuplicateCompensationFlatulons,
    decimal WalletBalanceAfterOpen);
