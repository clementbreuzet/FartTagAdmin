namespace FartSocial.Domain.Notifications;

public sealed class NotificationPreference
{
    public Guid UserId { get; set; }
    public bool SocialEnabled { get; set; } = true;
    public bool RewardsEnabled { get; set; } = true;
    public bool ChallengesEnabled { get; set; } = true;
    public bool DailyReminderEnabled { get; set; } = true;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
