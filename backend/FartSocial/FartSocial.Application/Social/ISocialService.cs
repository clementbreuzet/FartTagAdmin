using FartSocial.Application.Social.Dtos;

namespace FartSocial.Application.Social;

public interface ISocialService
{
    Task<IReadOnlyCollection<FeedItemDto>> GetFeedAsync(Guid viewerUserId, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<FriendDto>> GetFriendsAsync(Guid userId, CancellationToken cancellationToken);
    Task<FriendRequestsResponseDto> GetFriendRequestsAsync(Guid userId, CancellationToken cancellationToken);
    Task<FriendRequestDto?> RequestFriendAsync(Guid userId, Guid targetUserId, CancellationToken cancellationToken);
    Task<FriendRequestDto?> AcceptFriendRequestAsync(Guid userId, Guid requestId, CancellationToken cancellationToken);
    Task<FriendRequestDto?> RejectFriendRequestAsync(Guid userId, Guid requestId, CancellationToken cancellationToken);
    Task<bool> DeleteFriendAsync(Guid userId, Guid friendUserId, CancellationToken cancellationToken);
}
