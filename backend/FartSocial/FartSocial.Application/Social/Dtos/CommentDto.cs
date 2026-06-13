namespace FartSocial.Application.Social.Dtos;

public sealed record CommentDto(
    Guid Id,
    Guid FartEventId,
    Guid UserId,
    string UserName,
    string? AvatarUrl,
    string Content,
    DateTimeOffset CommentedAt);
