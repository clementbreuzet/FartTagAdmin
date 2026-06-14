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

        var comments = await dbContext.Comments
            .AsNoTracking()
            .Where(x => fartEventIds.Contains(x.FartEventId))
            .Join(dbContext.Users.AsNoTracking(),
                comment => comment.UserId,
                user => user.Id,
                (comment, user) => new CommentSnapshot(
                    comment.Id,
                    comment.FartEventId,
                    comment.UserId,
                    user.UserName,
                    user.AvatarUrl,
                    comment.Content,
                    comment.CommentedAt))
            .ToListAsync(cancellationToken);

        var commentsByEvent = comments
            .GroupBy(comment => comment.FartEventId)
            .ToDictionary(group => group.Key, group => group.OrderByDescending(x => x.CommentedAt).Take(2).ToList());

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

            commentsByEvent.TryGetValue(snapshot.Id, out var recentComments);

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
                comments.Count(comment => comment.FartEventId == snapshot.Id),
                (recentComments ?? new List<CommentSnapshot>()).Select(comment => new CommentDto(
                    comment.Id,
                    comment.FartEventId,
                    comment.UserId,
                    comment.UserName,
                    comment.AvatarUrl,
                    comment.Content,
                    comment.CommentedAt)).ToList());
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
        var recentBadges = await dbContext.UserBadges.AsNoTracking()
            .Where(item => item.UserId == profileUserId)
            .OrderByDescending(item => item.EarnedAt)
            .Take(5)
            .Select(item => new UserProfileBadgeDto(
                item.BadgeId,
                item.Badge!.Name,
                item.Badge.Description,
                item.EarnedAt))
            .ToListAsync(cancellationToken);

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
            recentBadges);
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
        var resultUserIds = users.Select(item => item.Id).ToArray();
        var friendships = await dbContext.Friendships.AsNoTracking()
            .Where(item =>
                (item.UserId == userId && resultUserIds.Contains(item.FriendUserId)) ||
                (item.FriendUserId == userId && resultUserIds.Contains(item.UserId)))
            .ToListAsync(cancellationToken);
        var requests = await dbContext.FriendRequests.AsNoTracking()
            .Where(item => item.Status == FriendRequestStatus.Pending &&
                ((item.RequesterUserId == userId && resultUserIds.Contains(item.RecipientUserId)) ||
                 (item.RecipientUserId == userId && resultUserIds.Contains(item.RequesterUserId))))
            .ToListAsync(cancellationToken);
        var titleIds = users.Where(item => item.EquippedTitleInventoryItemId.HasValue)
            .Select(item => item.EquippedTitleInventoryItemId!.Value).ToArray();
        var titles = await dbContext.InventoryItems.AsNoTracking()
            .Where(item => titleIds.Contains(item.Id))
            .ToDictionaryAsync(item => item.Id, item => item.Name, cancellationToken);
        var badges = await dbContext.UserBadges.AsNoTracking()
            .Where(item => resultUserIds.Contains(item.UserId))
            .Include(item => item.Badge)
            .OrderByDescending(item => item.Badge!.Rarity)
            .ToListAsync(cancellationToken);

        return users.Select(user =>
        {
            titles.TryGetValue(user.EquippedTitleInventoryItemId ?? Guid.Empty, out var equippedTitle);
            var badgeRarity = badges.FirstOrDefault(item => item.UserId == user.Id)?.Badge?.Rarity.ToString().ToLowerInvariant();
            return new UserSearchResultDto(
                user.Id,
                user.UserName,
                user.UserName,
                user.AvatarUrl,
                equippedTitle,
                badgeRarity,
                friendships.Any(item => item.UserId == user.Id || item.FriendUserId == user.Id),
                requests.Any(item => item.RequesterUserId == user.Id || item.RecipientUserId == user.Id));
        }).ToList();
    }

    public async Task<IReadOnlyCollection<FriendDto>> GetFriendsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var friendships = await dbContext.Friendships
            .AsNoTracking()
            .Where(friendship => friendship.UserId == userId || friendship.FriendUserId == userId)
            .ToListAsync(cancellationToken);

        var friendIds = friendships
            .Select(friendship => friendship.UserId == userId ? friendship.FriendUserId : friendship.UserId)
            .Distinct()
            .ToArray();

        if (friendIds.Length == 0)
        {
            return Array.Empty<FriendDto>();
        }

        var friends = await dbContext.Users
            .AsNoTracking()
            .Where(user => friendIds.Contains(user.Id))
            .ToDictionaryAsync(user => user.Id, cancellationToken);

        return friendships.Select(friendship =>
        {
            var friendId = friendship.UserId == userId ? friendship.FriendUserId : friendship.UserId;
            var friend = friends[friendId];
            return new FriendDto(friend.Id, friend.UserName, friend.AvatarUrl, friendship.AcceptedAt);
        }).ToList();
    }

    public async Task<FriendRequestsResponseDto> GetFriendRequestsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var requests = await dbContext.FriendRequests
            .AsNoTracking()
            .Where(request => request.Status == FriendRequestStatus.Pending && (request.RequesterUserId == userId || request.RecipientUserId == userId))
            .ToListAsync(cancellationToken);

        var userIds = requests
            .SelectMany(request => new[] { request.RequesterUserId, request.RecipientUserId })
            .Distinct()
            .ToArray();

        var users = await dbContext.Users
            .AsNoTracking()
            .Where(user => userIds.Contains(user.Id))
            .ToDictionaryAsync(user => user.Id, cancellationToken);

        FriendRequestDto MapRequest(FriendRequest request) =>
            new(
                request.Id,
                request.RequesterUserId,
                users[request.RequesterUserId].UserName,
                users[request.RequesterUserId].AvatarUrl,
                request.RecipientUserId,
                users[request.RecipientUserId].UserName,
                users[request.RecipientUserId].AvatarUrl,
                request.Status.ToString().ToLowerInvariant(),
                request.RequestedAt,
                request.RespondedAt);

        var incoming = requests
            .Where(request => request.RecipientUserId == userId)
            .Select(MapRequest)
            .ToList();

        var outgoing = requests
            .Where(request => request.RequesterUserId == userId)
            .Select(MapRequest)
            .ToList();

        return new FriendRequestsResponseDto(incoming, outgoing);
    }

    public async Task<FriendRequestDto?> RequestFriendAsync(Guid userId, Guid targetUserId, CancellationToken cancellationToken)
    {
        if (userId == targetUserId)
        {
            throw new InvalidOperationException("Vous ne pouvez pas vous ajouter vous-même.");
        }

        var targetExists = await dbContext.Users.AnyAsync(user => user.Id == targetUserId && user.IsActive, cancellationToken);
        if (!targetExists)
        {
            return null;
        }

        var alreadyFriends = await dbContext.Friendships.AnyAsync(friendship =>
            (friendship.UserId == userId && friendship.FriendUserId == targetUserId) ||
            (friendship.UserId == targetUserId && friendship.FriendUserId == userId),
            cancellationToken);
        if (alreadyFriends)
        {
            throw new InvalidOperationException("Vous êtes déjà amis.");
        }

        var reversePending = await dbContext.FriendRequests.FirstOrDefaultAsync(request =>
            request.Status == FriendRequestStatus.Pending &&
            request.RequesterUserId == targetUserId &&
            request.RecipientUserId == userId,
            cancellationToken);
        if (reversePending is not null)
        {
            return await AcceptFriendRequestAsync(userId, reversePending.Id, cancellationToken);
        }

        var existingPending = await dbContext.FriendRequests.AnyAsync(request =>
            request.Status == FriendRequestStatus.Pending &&
            request.RequesterUserId == userId &&
            request.RecipientUserId == targetUserId,
            cancellationToken);
        if (existingPending)
        {
            throw new InvalidOperationException("Une demande est déjà en attente.");
        }

        var request = new FriendRequest
        {
            RecipientUserId = targetUserId,
            RequestedAt = DateTimeOffset.UtcNow,
            RequesterUserId = userId,
            Status = FriendRequestStatus.Pending,
        };

        dbContext.FriendRequests.Add(request);
        await dbContext.SaveChangesAsync(cancellationToken);
        return await MapFriendRequestAsync(request.Id, cancellationToken);
    }

    public async Task<FriendRequestDto?> AcceptFriendRequestAsync(Guid userId, Guid requestId, CancellationToken cancellationToken)
    {
        var request = await dbContext.FriendRequests.FirstOrDefaultAsync(x => x.Id == requestId && x.RecipientUserId == userId, cancellationToken);
        if (request is null)
        {
            return null;
        }

        if (request.Status != FriendRequestStatus.Pending)
        {
            throw new InvalidOperationException("Cette demande n'est plus valide.");
        }

        var alreadyFriends = await dbContext.Friendships.AnyAsync(friendship =>
            (friendship.UserId == request.RequesterUserId && friendship.FriendUserId == request.RecipientUserId) ||
            (friendship.UserId == request.RecipientUserId && friendship.FriendUserId == request.RequesterUserId),
            cancellationToken);
        if (!alreadyFriends)
        {
            dbContext.Friendships.Add(new Friendship
            {
                AcceptedAt = DateTimeOffset.UtcNow,
                FriendUserId = request.RecipientUserId,
                UserId = request.RequesterUserId,
            });
        }

        request.Status = FriendRequestStatus.Accepted;
        request.RespondedAt = DateTimeOffset.UtcNow;
        request.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return await MapFriendRequestAsync(request.Id, cancellationToken);
    }

    public async Task<FriendRequestDto?> RejectFriendRequestAsync(Guid userId, Guid requestId, CancellationToken cancellationToken)
    {
        var request = await dbContext.FriendRequests.FirstOrDefaultAsync(
            x => x.Id == requestId && x.RecipientUserId == userId,
            cancellationToken);
        if (request is null)
        {
            return null;
        }

        if (request.Status != FriendRequestStatus.Pending)
        {
            throw new InvalidOperationException("Cette demande n'est plus valide.");
        }

        request.Status = FriendRequestStatus.Rejected;
        request.RespondedAt = DateTimeOffset.UtcNow;
        request.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return await MapFriendRequestAsync(request.Id, cancellationToken);
    }

    public async Task<bool> DeleteFriendAsync(Guid userId, Guid friendUserId, CancellationToken cancellationToken)
    {
        var friendship = await dbContext.Friendships.FirstOrDefaultAsync(x =>
            (x.UserId == userId && x.FriendUserId == friendUserId) ||
            (x.UserId == friendUserId && x.FriendUserId == userId),
            cancellationToken);
        if (friendship is null)
        {
            return false;
        }

        dbContext.Friendships.Remove(friendship);

        var pendingRequests = await dbContext.FriendRequests
            .Where(request =>
                (request.RequesterUserId == userId && request.RecipientUserId == friendUserId) ||
                (request.RequesterUserId == friendUserId && request.RecipientUserId == userId))
            .ToListAsync(cancellationToken);

        if (pendingRequests.Count > 0)
        {
            dbContext.FriendRequests.RemoveRange(pendingRequests);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task<FriendRequestDto?> MapFriendRequestAsync(Guid requestId, CancellationToken cancellationToken)
    {
        var request = await dbContext.FriendRequests.AsNoTracking().FirstOrDefaultAsync(x => x.Id == requestId, cancellationToken);
        if (request is null)
        {
            return null;
        }

        var requester = await dbContext.Users.AsNoTracking().FirstAsync(x => x.Id == request.RequesterUserId, cancellationToken);
        var recipient = await dbContext.Users.AsNoTracking().FirstAsync(x => x.Id == request.RecipientUserId, cancellationToken);
        return new FriendRequestDto(
            request.Id,
            requester.Id,
            requester.UserName,
            requester.AvatarUrl,
            recipient.Id,
            recipient.UserName,
            recipient.AvatarUrl,
            request.Status.ToString().ToLowerInvariant(),
            request.RequestedAt,
            request.RespondedAt);
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

    private sealed record CommentSnapshot(
        Guid Id,
        Guid FartEventId,
        Guid UserId,
        string UserName,
        string? AvatarUrl,
        string Content,
        DateTimeOffset CommentedAt);
}
