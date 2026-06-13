using FartSocial.Domain.Common;

namespace FartSocial.Domain.FartEvents;

public sealed class FartEventReaction : Entity
{
    public Guid FartEventId { get; set; }
    public Guid UserId { get; set; }
    public FartReactionType ReactionType { get; set; }
    public DateTimeOffset ReactedAt { get; set; } = DateTimeOffset.UtcNow;

    public FartEvent? FartEvent { get; set; }
}
