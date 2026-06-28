namespace FartSocial.Application.Home.Dtos;

public sealed record HomeDashboardDto(
    int Level,
    int Xp,
    int Flatulons,
    int Gems,
    DailyChallengeDto DailyChallenge,
    int DailyChallengeProgress,
    bool DailyChestAvailable,
    IReadOnlyCollection<HomeFartEventDto> RecentFarts);

public sealed record DailyChallengeDto(
    Guid Id,
    string Title,
    string Description,
    int TargetCount,
    int RewardFlatulons);

public sealed record HomeFartEventDto(
    Guid Id,
    DateTimeOffset OccurredAt,
    int OfficialScore,
    int DurationMs,
    int AudioLevel,
    int GasLevel,
    string Category,
    bool IsAuthenticated);
