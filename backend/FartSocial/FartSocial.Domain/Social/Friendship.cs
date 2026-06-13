using FartSocial.Domain.Common;

namespace FartSocial.Domain.Social;

public sealed class Friendship : Entity
{
    public Guid UserId { get; set; }
    public Guid FriendUserId { get; set; }
    public DateTimeOffset AcceptedAt { get; set; } = DateTimeOffset.UtcNow;
}
