using FartSocial.Application.Leaderboards;
using FartSocial.Application.Leaderboards.Dtos;
using FartSocial.Domain.Social;
using FartSocial.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FartSocial.Infrastructure.Leaderboards;

public sealed class LeaderboardService(FartSocialDbContext dbContext) : ILeaderboardService
{
    private const int TopLimit = 20;

    public async Task<LeaderboardsResponseDto> GetGlobalAsync(CancellationToken cancellationToken)
    {
        return await BuildAsync(null, cancellationToken);
    }

    public async Task<LeaderboardsResponseDto> GetFriendsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var scopeUserIds = await GetFriendScopeUserIdsAsync(userId, cancellationToken);
        return await BuildAsync(scopeUserIds, cancellationToken);
    }

    private async Task<LeaderboardsResponseDto> BuildAsync(IReadOnlyCollection<Guid>? scopeUserIds, CancellationToken cancellationToken)
    {
        var scoreQuery = ApplyScope(dbContext.FartEvents.AsNoTracking(), scopeUserIds);

        var globalScores = await scoreQuery
            .GroupBy(x => x.UserId)
            .Select(group => new LeaderboardAggregate(group.Key, group.Sum(item => item.OfficialScore), null, null))
            .OrderByDescending(item => item.Score)
            .ThenBy(item => item.UserId)
            .Take(TopLimit)
            .ToListAsync(cancellationToken);

        var weekCutoff = DateTimeOffset.UtcNow.AddDays(-7);
        var weekScores = await ApplyScope(dbContext.FartEvents.AsNoTracking().Where(x => x.OccurredAt >= weekCutoff), scopeUserIds)
            .GroupBy(x => x.UserId)
            .Select(group => new LeaderboardAggregate(group.Key, group.Sum(item => item.OfficialScore), null, null))
            .OrderByDescending(item => item.Score)
            .ThenBy(item => item.UserId)
            .Take(TopLimit)
            .ToListAsync(cancellationToken);

        var longestScores = await scoreQuery
            .GroupBy(x => x.UserId)
            .Select(group => new LeaderboardAggregate(group.Key, group.Max(item => item.DurationMs), group.Max(item => item.DurationMs), null))
            .OrderByDescending(item => item.DurationMs ?? 0)
            .ThenBy(item => item.UserId)
            .Take(TopLimit)
            .ToListAsync(cancellationToken);

        var toxicScores = await scoreQuery
            .GroupBy(x => x.UserId)
            .Select(group => new LeaderboardAggregate(group.Key, group.Max(item => item.GasLevel), null, group.Max(item => item.GasLevel)))
            .OrderByDescending(item => item.GasLevel ?? 0)
            .ThenBy(item => item.UserId)
            .Take(TopLimit)
            .ToListAsync(cancellationToken);

        var userIds = globalScores
            .Concat(weekScores)
            .Concat(longestScores)
            .Concat(toxicScores)
            .Select(item => item.UserId)
            .Distinct()
            .ToArray();

        var users = await dbContext.Users
            .AsNoTracking()
            .Where(user => userIds.Contains(user.Id))
            .Select(user => new UserSnapshot(
                user.Id,
                user.UserName,
                user.AvatarUrl,
                user.EquippedTitleInventoryItemId))
            .ToListAsync(cancellationToken);

        var titleIds = users
            .Where(user => user.EquippedTitleInventoryItemId.HasValue)
            .Select(user => user.EquippedTitleInventoryItemId!.Value)
            .Distinct()
            .ToArray();

        var titles = await dbContext.InventoryItems
            .AsNoTracking()
            .Where(item => titleIds.Contains(item.Id))
            .ToDictionaryAsync(item => item.Id, item => item.Name, cancellationToken);

        var badgeNames = await GetTopBadgesAsync(userIds, cancellationToken);

        return new LeaderboardsResponseDto(
            BuildBoard("global", "Score global", "Points", globalScores, users, titles, badgeNames),
            BuildBoard("week", "Semaine", "Points semaine", weekScores, users, titles, badgeNames),
            BuildBoard("longest", "Plus long", "Durée maximale", longestScores, users, titles, badgeNames),
            BuildBoard("toxic", "Plus toxique", "Gaz maximal", toxicScores, users, titles, badgeNames));
    }

    private static IQueryable<FartSocial.Domain.FartEvents.FartEvent> ApplyScope(
        IQueryable<FartSocial.Domain.FartEvents.FartEvent> query,
        IReadOnlyCollection<Guid>? scopeUserIds)
    {
        return scopeUserIds is null || scopeUserIds.Count == 0
            ? query
            : query.Where(item => scopeUserIds.Contains(item.UserId));
    }

    private static LeaderboardBoardDto BuildBoard(
        string key,
        string title,
        string metricLabel,
        IReadOnlyCollection<LeaderboardAggregate> aggregates,
        IReadOnlyCollection<UserSnapshot> users,
        IReadOnlyDictionary<Guid, string> titles,
        IReadOnlyDictionary<Guid, BadgeSnapshot> badgeNames)
    {
        var userLookup = users.ToDictionary(user => user.Id, user => user);
        var entries = aggregates.Select((aggregate, index) =>
        {
            userLookup.TryGetValue(aggregate.UserId, out var user);
            titles.TryGetValue(user?.EquippedTitleInventoryItemId ?? Guid.Empty, out var titleName);
            badgeNames.TryGetValue(aggregate.UserId, out var badge);

            return new LeaderboardEntryDto(
                index + 1,
                aggregate.UserId,
                user?.UserName ?? "Unknown",
                user?.AvatarUrl,
                string.IsNullOrWhiteSpace(titleName) ? null : titleName,
                aggregate.Score,
                aggregate.DurationMs,
                aggregate.GasLevel,
                badge?.Name,
                badge?.Rarity);
        }).ToList();

        return new LeaderboardBoardDto(key, title, metricLabel, entries);
    }

    private async Task<IReadOnlyDictionary<Guid, BadgeSnapshot>> GetTopBadgesAsync(Guid[] userIds, CancellationToken cancellationToken)
    {
        if (userIds.Length == 0)
        {
            return new Dictionary<Guid, BadgeSnapshot>();
        }

        var badgeRows = await dbContext.UserBadges
            .AsNoTracking()
            .Where(userBadge => userIds.Contains(userBadge.UserId))
            .Include(userBadge => userBadge.Badge)
            .OrderByDescending(userBadge => userBadge.Badge!.Rarity)
            .ThenByDescending(userBadge => userBadge.EarnedAt)
            .ToListAsync(cancellationToken);

        return badgeRows
            .GroupBy(row => row.UserId)
            .ToDictionary(
                group => group.Key,
                group =>
                {
                    var top = group.First();
                    return new BadgeSnapshot(top.Badge!.Name, top.Badge.Rarity.ToString().ToLowerInvariant());
                });
    }

    private async Task<IReadOnlyCollection<Guid>> GetFriendScopeUserIdsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var friendIds = await dbContext.Friendships
            .AsNoTracking()
            .Where(friendship => friendship.UserId == userId || friendship.FriendUserId == userId)
            .Select(friendship => friendship.UserId == userId ? friendship.FriendUserId : friendship.UserId)
            .Distinct()
            .ToListAsync(cancellationToken);

        friendIds.Add(userId);
        return friendIds.Distinct().ToArray();
    }

    private sealed record LeaderboardAggregate(Guid UserId, int Score, int? DurationMs, int? GasLevel);

    private sealed record UserSnapshot(Guid Id, string UserName, string? AvatarUrl, Guid? EquippedTitleInventoryItemId);

    private sealed record BadgeSnapshot(string Name, string Rarity);
}
