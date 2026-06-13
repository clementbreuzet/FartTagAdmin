using FartSocial.Domain.Common;

namespace FartSocial.Domain.LootBoxes;

public sealed class LootBoxReward : Entity
{
    public Guid LootBoxId { get; set; }
    public Guid InventoryItemId { get; set; }
    public LootBoxRarity Rarity { get; set; }
    public decimal Weight { get; set; }
    public int DuplicateCompensationFlatulons { get; set; }
    public bool IsActive { get; set; } = true;

    public LootBox? LootBox { get; set; }
    public InventoryItem? InventoryItem { get; set; }
}
