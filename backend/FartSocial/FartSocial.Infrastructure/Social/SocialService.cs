using System.Text.Json;
using FartSocial.Application.FartEvents.Dtos;
using FartSocial.Application.Social;
using FartSocial.Application.Social.Dtos;
using FartSocial.Domain.FartEvents;
using FartSocial.Domain.Social;
using FartSocial.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FartSocial.Infrastructure.Social;

public sealed class SocialService(FartSocialDbContext dbContext) : ISocialService
{
    private const int FeedLimit = 20;

    public async Task<IReadOnlyCollection<FeedItemDto>> GetFeedAsync(Guid viewerUserId, CancellationToken cancellationToken)
    {
        var snapshots = await dbContext.FartEvents
            .AsNoTracking()
            .Where(x => x.Visibility == FartVisibility.Public)
            .OrderByDescending(x => x.OccurredAt)
            .Take(FeedLimit)
            .Join(dbContext.Users.AsNoTracking(),
                fartEvent => fartEvent.UserId,
                user => user.Id,
                (fartEvent, user) => new FeedSnapshot(
                    fartEvent.Id,
                    fartEvent.UserId,
                    user.UserName,
                    user.AvatarUrl,
                    fartEvent.OfficialScore,
                    fartEvent.DurationMs,
                    fartEvent.AudioLevel,
                    fartEvent.GasLevel,
                    fartEvent.Temperature,
                    fartEvent.OccurredAt,
                    fartEvent.IsAuthenticated,
                    fartEvent.Category,
                    fartEvent.AudioFileId))
            .ToListAsync(cancellationToken);

        var fartEventIds = snapshots.Select(x => x.Id).ToArray();
        var reactions = await dbContext.Reactions
            .AsNoTracking()
            .Where(x => fartEventIds.Contains(x.FartEventId))
            .ToListAsync(cancellationToken);

        return snapshots.Select(snapshot =>
        {
            var eventReactions = reactions.Where(reaction => reaction.FartEventId == snapshot.Id).ToList();
            var viewerReaction = eventReactions.FirstOrDefault(reaction => reaction.UserId == viewerUserId)?.ReactionType.ToString().ToLowerInvariant();
            var reactionSummary = new FartReactionSummaryDto(
                eventReactions.Count(reaction => reaction.ReactionType == FartReactionType.Fire),
                eventReactions.Count(reaction => reaction.ReactionType == FartReactionType.Laugh),
                eventReactions.Count(reaction => reaction.ReactionType == FartReactionType.Shock),
                eventReactions.Count(reaction => reaction.ReactionType == FartReactionType.Heart),
                viewerReaction);

            return new FeedItemDto(
                snapshot.Id,
                snapshot.UserId,
                snapshot.UserName,
                snapshot.AvatarUrl,
                snapshot.OfficialScore,
                snapshot.DurationMs,
                snapshot.AudioLevel,
                snapshot.GasLevel,
                snapshot.Temperature,
                snapshot.Timestamp,
                snapshot.IsAuthenticated,
                snapshot.Category,
                snapshot.AudioFileId.HasValue ? $"/api/fart-events/audio/{snapshot.AudioFileId.Value}" : null,
                reactionSummary,
                0,
                Array.Empty<CommentDto>());
        }).ToList();
    }

    public async Task<UserProfileDto?> GetProfileAsync(Guid viewerUserId, Guid profileUserId, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == profileUserId && item.IsActive, cancellationToken);
        if (user is null)
        {
            return null;
        }

        var isOwner = viewerUserId == profileUserId;
        var events = await dbContext.FartEvents.AsNoTracking()
            .Where(item => item.UserId == profileUserId && (isOwner || item.Visibility == FartVisibility.Public))
            .ToListAsync(cancellationToken);
        var eventIds = events.Select(item => item.Id).ToArray();
        var totalReactions = eventIds.Length == 0
            ? 0
            : await dbContext.Reactions.CountAsync(item => eventIds.Contains(item.FartEventId), cancellationToken);

        var title = user.EquippedTitleInventoryItemId.HasValue
            ? await dbContext.InventoryItems.AsNoTracking()
                .Where(item => item.Id == user.EquippedTitleInventoryItemId.Value)
                .Select(item => item.Name)
                .FirstOrDefaultAsync(cancellationToken)
            : null;
        var frame = user.EquippedProfileFrameInventoryItemId.HasValue
            ? await dbContext.InventoryItems.AsNoTracking()
                .Where(item => item.Id == user.EquippedProfileFrameInventoryItemId.Value)
                .Select(item => new EquippedFrameDto(item.Id, item.Name, item.AssetKey))
                .FirstOrDefaultAsync(cancellationToken)
            : null;
        var totalFarts = events.Count;
        var level = Math.Max(1, totalFarts / 10 + 1);
        var best = events.OrderByDescending(item => item.OfficialScore).ThenByDescending(item => item.OccurredAt).FirstOrDefault();
        return new UserProfileDto(
            user.Id,
            user.UserName,
            user.UserName,
            user.AvatarUrl,
            title,
            frame,
            level,
            totalFarts % 10 * 10,
            new UserProfileStatsDto(
                totalFarts,
                events.Count(item => item.Visibility == FartVisibility.Public),
                events.Count(item => item.Category is "legendary" or "mythic"),
                totalFarts == 0 ? 0 : Math.Round((decimal)events.Average(item => item.OfficialScore), 1),
                totalReactions),
            best is null ? null : new UserProfileBestFartDto(best.Id, best.OfficialScore, best.OccurredAt),
            Array.Empty<UserProfileBadgeDto>());
    }

    public async Task<IReadOnlyCollection<UserSearchResultDto>> SearchUsersAsync(Guid userId, string query, CancellationToken cancellationToken)
    {
        var normalizedQuery = query.Trim().ToUpperInvariant();
        if (normalizedQuery.Length < 2)
        {
            return Array.Empty<UserSearchResultDto>();
        }

        var users = await dbContext.Users.AsNoTracking()
            .Where(item => item.IsActive && item.Id != userId && item.NormalizedUserName.Contains(normalizedQuery))
            .OrderBy(item => item.UserName)
            .Take(20)
            .ToListAsync(cancellationToken);

        return users.Select(user => new UserSearchResultDto(
            user.Id,
            user.UserName,
            user.UserName,
            user.AvatarUrl,
            null,
            null,
            false,
            false)).ToList();
    }

    public Task<IReadOnlyCollection<FriendDto>> GetFriendsAsync(Guid userId, CancellationToken cancellationToken)
    {
        return Task.FromResult<IReadOnlyCollection<FriendDto>>(Array.Empty<FriendDto>());
    }

    public Task<FriendRequestsResponseDto> GetFriendRequestsAsync(Guid userId, CancellationToken cancellationToken)
    {
        return Task.FromResult(new FriendRequestsResponseDto(Array.Empty<FriendRequestDto>(), Array.Empty<FriendRequestDto>()));
    }

    public Task<FriendRequestDto?> RequestFriendAsync(Guid userId, Guid targetUserId, CancellationToken cancellationToken)
    {
        return Task.FromResult<FriendRequestDto?>(null);
    }

    public Task<FriendRequestDto?> AcceptFriendRequestAsync(Guid userId, Guid requestId, CancellationToken cancellationToken)
    {
        return Task.FromResult<FriendRequestDto?>(null);
    }

    public Task<FriendRequestDto?> RejectFriendRequestAsync(Guid userId, Guid requestId, CancellationToken cancellationToken)
    {
        return Task.FromResult<FriendRequestDto?>(null);
    }

    public Task<bool> DeleteFriendAsync(Guid userId, Guid friendUserId, CancellationToken cancellationToken)
    {
        return Task.FromResult(false);
    }

    private sealed record FeedSnapshot(
        Guid Id,
        Guid UserId,
        string UserName,
        string? AvatarUrl,
        int OfficialScore,
        int DurationMs,
        int AudioLevel,
        int GasLevel,
        decimal Temperature,
        DateTimeOffset Timestamp,
        bool IsAuthenticated,
        string Category,
        Guid? AudioFileId);

}
