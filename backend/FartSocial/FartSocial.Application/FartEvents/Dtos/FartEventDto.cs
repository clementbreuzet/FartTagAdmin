using FartSocial.Domain.FartEvents;

namespace FartSocial.Application.FartEvents.Dtos;

public sealed record FartEventDto(
    Guid Id,
    Guid UserId,
    Guid DeviceId,
    Guid? AudioFileId,
    DateTimeOffset Timestamp,
    int AudioLevel,
    int GasLevel,
    decimal Temperature,
    int DurationMs,
    int LocalScore,
    int OfficialScore,
    int Authenticity,
    bool IsAuthenticated,
    string Category,
    FartVisibility Visibility,
    IReadOnlyCollection<FartRewardDto> Rewards,
    IReadOnlyCollection<string> Badges,
    FartReactionSummaryDto Reactions);
