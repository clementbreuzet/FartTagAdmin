using FartSocial.Application.Leaderboards.Dtos;

namespace FartSocial.Application.Leaderboards;

public interface ILeaderboardService
{
    Task<LeaderboardsResponseDto> GetGlobalAsync(CancellationToken cancellationToken);
    Task<LeaderboardsResponseDto> GetFriendsAsync(Guid userId, CancellationToken cancellationToken);
}
