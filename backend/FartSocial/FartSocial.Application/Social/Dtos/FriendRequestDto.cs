namespace FartSocial.Application.Social.Dtos;

public sealed record FriendRequestDto(
    Guid Id,
    Guid RequesterUserId,
    string RequesterUserName,
    string? RequesterAvatarUrl,
    Guid RecipientUserId,
    string RecipientUserName,
    string? RecipientAvatarUrl,
    string Status,
    DateTimeOffset RequestedAt,
    DateTimeOffset? RespondedAt);
