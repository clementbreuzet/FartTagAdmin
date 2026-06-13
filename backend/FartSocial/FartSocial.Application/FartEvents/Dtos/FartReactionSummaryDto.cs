namespace FartSocial.Application.FartEvents.Dtos;

public sealed record FartReactionSummaryDto(
    int Fire,
    int Laugh,
    int Shock,
    int Heart,
    string? ViewerReaction);
