using FartSocial.Domain.Common;

namespace FartSocial.Domain.LootBoxes;

public sealed class UserInventoryItem : Entity
{
    public Guid UserId { get; set; }
    public Guid InventoryItemId { get; set; }
    public Guid LootBoxRewardId { get; set; }
    public bool IsDuplicate { get; set; }
    public int? DuplicateCompensationFlatulons { get; set; }
    public DateTimeOffset AcquiredAt { get; set; } = DateTimeOffset.UtcNow;

    public InventoryItem? InventoryItem { get; set; }
    public LootBoxReward? LootBoxReward { get; set; }
}
