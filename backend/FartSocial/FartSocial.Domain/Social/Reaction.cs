using FartSocial.Domain.Common;
using FartSocial.Domain.FartEvents;

namespace FartSocial.Domain.Social;

public sealed class Reaction : Entity
{
    public Guid FartEventId { get; set; }
    public Guid UserId { get; set; }
    public FartReactionType ReactionType { get; set; }
    public DateTimeOffset ReactedAt { get; set; } = DateTimeOffset.UtcNow;

    public FartEvent? FartEvent { get; set; }
}
