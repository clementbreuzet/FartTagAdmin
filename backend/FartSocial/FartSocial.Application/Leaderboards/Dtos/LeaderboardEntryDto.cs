namespace FartSocial.Application.Leaderboards.Dtos;

public sealed record LeaderboardEntryDto(
    int Rank,
    Guid UserId,
    string UserName,
    string? AvatarUrl,
    string? EquippedTitle,
    int Score,
    int? DurationMs,
    int? GasLevel,
    string? FeaturedBadgeName,
    string? FeaturedBadgeRarity);
