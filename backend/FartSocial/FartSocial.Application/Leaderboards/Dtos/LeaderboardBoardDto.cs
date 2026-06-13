namespace FartSocial.Application.Leaderboards.Dtos;

public sealed record LeaderboardBoardDto(
    string Key,
    string Title,
    string MetricLabel,
    IReadOnlyCollection<LeaderboardEntryDto> Entries);
