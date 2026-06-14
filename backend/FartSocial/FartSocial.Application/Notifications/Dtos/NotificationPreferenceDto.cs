namespace FartSocial.Application.Notifications.Dtos;

public sealed record NotificationPreferenceDto(
    bool SocialEnabled,
    bool RewardsEnabled,
    bool ChallengesEnabled,
    bool DailyReminderEnabled);
