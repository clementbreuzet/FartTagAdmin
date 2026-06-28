using FartSocial.Domain.Common;

namespace FartSocial.Domain.Daily;

public sealed class DailyChallenge : Entity
{
    public DateOnly ChallengeDate { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int TargetCount { get; set; }
    public int RewardFlatulons { get; set; }
    public bool IsActive { get; set; } = true;
}
