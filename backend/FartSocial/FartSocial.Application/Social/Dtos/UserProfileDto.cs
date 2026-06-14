namespace FartSocial.Application.Social.Dtos;

public sealed record UserProfileDto(
    Guid Id,
    string UserName,
    string DisplayName,
    string? AvatarUrl,
    string? EquippedTitle,
    EquippedFrameDto? EquippedFrame,
    int Level,
    int LevelProgressPercent,
    UserProfileStatsDto GlobalStats,
    UserProfileBestFartDto? BestFart,
    IReadOnlyCollection<UserProfileBadgeDto> RecentBadges);

public sealed record EquippedFrameDto(Guid Id, string Name, string? AssetKey);

public sealed record UserProfileStatsDto(
    int TotalFarts,
    int PublicFarts,
    int LegendaryFarts,
    decimal AverageOfficialScore,
    int TotalReactionsReceived);

public sealed record UserProfileBestFartDto(Guid Id, int OfficialScore, DateTimeOffset OccurredAt);

public sealed record UserProfileBadgeDto(Guid Id, string Name, string Description, DateTimeOffset UnlockedAt);
