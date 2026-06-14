using FartSocial.Domain.Common;

namespace FartSocial.Domain.Notifications;

public sealed class UserPushToken : Entity
{
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public string Platform { get; set; } = string.Empty;
    public string? DeviceName { get; set; }
    public DateTimeOffset LastSeenAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? RevokedAt { get; set; }
}
