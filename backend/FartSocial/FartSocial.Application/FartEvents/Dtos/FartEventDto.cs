using System.Text.Json.Serialization;
using FartSocial.Domain.FartEvents;
using FartSocial.Application.Social.Dtos;
using FartSocial.Application.Progression.Dtos;

namespace FartSocial.Application.FartEvents.Dtos;

public sealed record FartEventDto(
    Guid Id,
    Guid UserId,
    Guid DeviceId,
    string DeviceName,
    string DeviceModel,
    Guid? AudioFileId,
    string? AudioReplayUrl,
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
    IReadOnlyCollection<FartRewardDto> RewardItems,
    [property: JsonPropertyName("rewards")] FartRewardsDto? Rewards,
    IReadOnlyCollection<string> Badges,
    FartReactionSummaryDto Reactions,
    IReadOnlyCollection<CommentDto> Comments);
