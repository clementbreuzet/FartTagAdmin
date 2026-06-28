using FartSocial.Application.Leaderboards;
using FartSocial.Application.Leaderboards.Dtos;
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

        var rawGlobalScores = await scoreQuery
            .GroupBy(x => x.UserId)
            .Select(group => new
            {
                UserId = group.Key,
                Score = group.Sum(item => item.OfficialScore)
            })
            .OrderByDescending(item => item.Score)
            .ThenBy(item => item.UserId)
            .Take(TopLimit)
            .ToListAsync(cancellationToken);

        var globalScores = rawGlobalScores
            .Select(item => new LeaderboardAggregate(
                item.UserId,
                item.Score,
                null,
                null))
            .ToList();

        var weekCutoff = DateTimeOffset.UtcNow.AddDays(-7);

        var weekRawScores = await ApplyScope(
                dbContext.FartEvents
                    .AsNoTracking()
                    .Where(x => x.OccurredAt >= weekCutoff),
                scopeUserIds)
                    .GroupBy(x => x.UserId)
                    .Select(group => new
                    {
                        UserId = group.Key,
                        Score = group.Sum(item => item.OfficialScore)
                    })
                    .OrderByDescending(item => item.Score)
                    .ThenBy(item => item.UserId)
                    .Take(TopLimit)
                    .ToListAsync(cancellationToken);

        var weekScores = weekRawScores
            .Select(item => new LeaderboardAggregate(
                item.UserId,
                item.Score,
                null,
                null))
            .ToList();

        var longestRawScores = await scoreQuery
            .GroupBy(x => x.UserId)
            .Select(group => new
            {
                UserId = group.Key,
                DurationMs = group.Max(item => item.DurationMs)
            })
            .OrderByDescending(item => item.DurationMs)
            .ThenBy(item => item.UserId)
            .Take(TopLimit)
            .ToListAsync(cancellationToken);

        var longestScores = longestRawScores
            .Select(item => new LeaderboardAggregate(
                item.UserId,
                item.DurationMs,
                item.DurationMs,
                null))
            .ToList();

        var toxicRawScores = await scoreQuery
            .GroupBy(x => x.UserId)
            .Select(group => new
            {
                UserId = group.Key,
                GasLevel = group.Max(item => item.GasLevel)
            })
            .OrderByDescending(item => item.GasLevel)
            .ThenBy(item => item.UserId)
            .Take(TopLimit)
            .ToListAsync(cancellationToken);

                var toxicScores = toxicRawScores
                    .Select(item => new LeaderboardAggregate(
                        item.UserId,
                        item.GasLevel,
                        null,
                        item.GasLevel))
                    .ToList();

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

        var badgeNames = new Dictionary<Guid, BadgeSnapshot>();

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

    private Task<IReadOnlyCollection<Guid>> GetFriendScopeUserIdsAsync(Guid userId, CancellationToken cancellationToken)
    {
        return Task.FromResult<IReadOnlyCollection<Guid>>(new[] { userId });
    }

    private sealed record LeaderboardAggregate(Guid UserId, int Score, int? DurationMs, int? GasLevel);

    private sealed record UserSnapshot(Guid Id, string UserName, string? AvatarUrl, Guid? EquippedTitleInventoryItemId);

    private sealed record BadgeSnapshot(string Name, string Rarity);
}
