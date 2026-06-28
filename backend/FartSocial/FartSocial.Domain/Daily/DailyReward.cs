using FartSocial.Domain.Common;

namespace FartSocial.Domain.Daily;

public sealed class DailyReward : Entity
{
    public Guid UserId { get; set; }
    public DateOnly RewardDate { get; set; }
    public bool IsClaimed { get; set; }
    public DateTimeOffset? ClaimedAt { get; set; }
}
