namespace FartSocial.Application.Badges.Dtos;

public sealed record BadgeDto(
    Guid Id,
    string Code,
    string Name,
    string Description,
    string Rarity,
    string? IconKey,
    bool IsActive);
