namespace FartSocial.Application.Badges.Dtos;

public sealed record UserBadgeDto(
    Guid Id,
    Guid BadgeId,
    string Code,
    string Name,
    string Description,
    string Rarity,
    string? IconKey,
    Guid? SourceFartEventId,
    DateTimeOffset EarnedAt);
