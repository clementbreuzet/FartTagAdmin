using FartSocial.Domain.Common;

namespace FartSocial.Domain.Badges;

public sealed class UserBadge : Entity
{
    public Guid UserId { get; set; }
    public Guid BadgeId { get; set; }
    public Guid? SourceFartEventId { get; set; }
    public DateTimeOffset EarnedAt { get; set; } = DateTimeOffset.UtcNow;

    public Badge? Badge { get; set; }
}
