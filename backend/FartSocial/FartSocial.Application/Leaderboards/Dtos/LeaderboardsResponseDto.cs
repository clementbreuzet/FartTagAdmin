namespace FartSocial.Application.Leaderboards.Dtos;

public sealed record LeaderboardsResponseDto(
    LeaderboardBoardDto Global,
    LeaderboardBoardDto Week,
    LeaderboardBoardDto Longest,
    LeaderboardBoardDto Toxic);
