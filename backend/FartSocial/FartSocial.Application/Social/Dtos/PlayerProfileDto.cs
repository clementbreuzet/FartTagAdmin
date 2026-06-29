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
    PlayerProfileLocationDto Location,
    PlayerProfileStatsDto Stats,
    PlayerProfileRankingsDto Rankings,
    PlayerNotificationSettingsDto Notifications,
    ConnectedDeviceDto? ConnectedDevice);

/// <summary>Player-only fart statistics for the V0 profile.</summary>
public sealed record PlayerProfileStatsDto(
    int TotalFarts,
    int BestScore,
    decimal AverageScore,
    int TotalDurationMs,
    decimal TotalGasLevel);

/// <summary>Location used to scope global rankings.</summary>
public sealed record PlayerProfileLocationDto(
    string Continent,
    string Country,
    string City);

/// <summary>Global rank for each V0 profile statistic.</summary>
public sealed record PlayerProfileRankingsDto(
    string Scope,
    int UserCount,
    int? TotalFarts,
    int? BestScore,
    int? AverageScore,
    int? TotalDurationMs,
    int? TotalGasLevel);

/// <summary>Notification state shown in the V0 profile settings section.</summary>
public sealed record PlayerNotificationSettingsDto(
    bool SocialEnabled,
    bool RewardsEnabled,
    bool ChallengesEnabled,
    bool DailyReminderEnabled,
    bool HasActivePushToken);

/// <summary>Connected FartTag device summary for the player.</summary>
public sealed record ConnectedDeviceDto(Guid Id, string Name, string Model);
