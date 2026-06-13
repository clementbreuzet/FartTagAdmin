namespace FartSocial.Application.Social.Dtos;

public sealed record FriendDto(
    Guid UserId,
    string UserName,
    string? AvatarUrl,
    DateTimeOffset Since);
