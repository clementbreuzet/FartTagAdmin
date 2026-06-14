namespace FartSocial.Application.Social.Dtos;

public sealed record UserSearchResultDto(
    Guid UserId,
    string UserName,
    string DisplayName,
    string? AvatarUrl,
    string? EquippedTitle,
    string? FeaturedBadgeRarity,
    bool IsFriend,
    bool HasPendingRequest);
