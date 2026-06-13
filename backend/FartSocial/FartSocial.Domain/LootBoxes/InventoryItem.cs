using FartSocial.Domain.Common;

namespace FartSocial.Domain.LootBoxes;

public sealed class InventoryItem : Entity
{
    public string Name { get; set; } = string.Empty;
    public InventoryItemCategory Category { get; set; }
    public LootBoxRarity Rarity { get; set; }
    public string? AssetKey { get; set; }
    public string? Description { get; set; }
    public bool IsTradable { get; set; }

    public ICollection<UserInventoryItem> UserItems { get; set; } = new List<UserInventoryItem>();
}
