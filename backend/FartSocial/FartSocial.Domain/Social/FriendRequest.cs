using FartSocial.Domain.Common;

namespace FartSocial.Domain.Social;

public sealed class FriendRequest : Entity
{
    public Guid RequesterUserId { get; set; }
    public Guid RecipientUserId { get; set; }
    public FriendRequestStatus Status { get; set; } = FriendRequestStatus.Pending;
    public DateTimeOffset RequestedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? RespondedAt { get; set; }
}
