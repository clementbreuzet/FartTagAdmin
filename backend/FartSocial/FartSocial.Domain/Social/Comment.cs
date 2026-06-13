using FartSocial.Domain.Common;

namespace FartSocial.Domain.Social;

public sealed class Comment : Entity
{
    public Guid FartEventId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTimeOffset CommentedAt { get; set; } = DateTimeOffset.UtcNow;
}
