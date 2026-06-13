namespace FartSocial.Application.FartEvents.Dtos;

public sealed record FartHistoryItemDto(
    Guid Id,
    DateTimeOffset Timestamp,
    int OfficialScore,
    int DurationMs,
    int AudioLevel,
    int GasLevel,
    decimal Temperature,
    bool IsAuthenticated,
    string Category,
    string Visibility,
    FartReactionSummaryDto Reactions);
