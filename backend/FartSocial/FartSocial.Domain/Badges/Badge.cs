using FartSocial.Domain.Common;

namespace FartSocial.Domain.Badges;

public sealed class Badge : Entity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public BadgeRarity Rarity { get; set; } = BadgeRarity.Common;
    public string? IconKey { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();
}
