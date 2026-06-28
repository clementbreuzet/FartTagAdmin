namespace FartSocial.Application.Social.Dtos;

/// <summary>Minimal V0 profile for the authenticated player.</summary>
public sealed record PlayerProfileDto(
    Guid Id,
    string UserName,
    string DisplayName,
    string? AvatarUrl,
    int Level,
    int TotalXp,
    int CurrentLevelXp,
    int RequiredLevelXp,
    int ProgressPercent,
    int Flatulons,
    int Gems,
    PlayerProfileStatsDto Stats,
    PlayerNotificationSettingsDto Notifications,
    ConnectedDeviceDto? ConnectedDevice);

/// <summary>Player-only fart statistics for the V0 profile.</summary>
public sealed record PlayerProfileStatsDto(
    int TotalFarts,
    int BestScore,
    decimal AverageScore,
    int TotalDurationMs,
    decimal TotalGasLevel);

/// <summary>Notification state shown in the V0 profile settings section.</summary>
public sealed record PlayerNotificationSettingsDto(
    bool SocialEnabled,
    bool RewardsEnabled,
    bool ChallengesEnabled,
    bool DailyReminderEnabled,
    bool HasActivePushToken);

/// <summary>Connected FartTag device summary for the player.</summary>
public sealed record ConnectedDeviceDto(Guid Id, string Name, string Model);
