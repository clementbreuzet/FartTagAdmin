using FartSocial.Application.FartEvents.Dtos;

namespace FartSocial.Application.Social.Dtos;

public sealed record FeedItemDto(
    Guid Id,
    Guid UserId,
    string UserName,
    string? AvatarUrl,
    int OfficialScore,
    int DurationMs,
    int AudioLevel,
    int GasLevel,
    decimal Temperature,
    DateTimeOffset Timestamp,
    bool IsAuthenticated,
    string Category,
    FartReactionSummaryDto Reactions,
    int CommentsCount,
    IReadOnlyCollection<CommentDto> RecentComments);
