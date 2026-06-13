using FartSocial.Domain.Common;

namespace FartSocial.Domain.LootBoxes;

public sealed class LootBox : Entity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PriceFlatulons { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<LootBoxReward> Rewards { get; set; } = new List<LootBoxReward>();
}
