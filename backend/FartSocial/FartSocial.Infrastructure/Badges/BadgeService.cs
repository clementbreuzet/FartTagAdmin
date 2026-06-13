using FartSocial.Application.Badges;
using FartSocial.Application.Badges.Dtos;
using FartSocial.Domain.Badges;
using FartSocial.Domain.FartEvents;
using FartSocial.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FartSocial.Infrastructure.Badges;

public sealed class BadgeService(FartSocialDbContext dbContext) : IBadgeService
{
    public async Task<IReadOnlyCollection<BadgeDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Badges
            .AsNoTracking()
            .Where(badge => badge.IsActive)
            .OrderBy(badge => badge.Rarity)
            .ThenBy(badge => badge.Name)
            .Select(badge => new BadgeDto(
                badge.Id,
                badge.Code,
                badge.Name,
                badge.Description,
                badge.Rarity.ToString().ToLowerInvariant(),
                badge.IconKey,
                badge.IsActive))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<UserBadgeDto>> GetMyBadgesAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await dbContext.UserBadges
            .AsNoTracking()
            .Where(userBadge => userBadge.UserId == userId)
            .OrderByDescending(userBadge => userBadge.EarnedAt)
            .Select(userBadge => new UserBadgeDto(
                userBadge.Id,
                userBadge.BadgeId,
                userBadge.Badge!.Code,
                userBadge.Badge.Name,
                userBadge.Badge.Description,
                userBadge.Badge.Rarity.ToString().ToLowerInvariant(),
                userBadge.Badge.IconKey,
                userBadge.SourceFartEventId,
                userBadge.EarnedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<UserBadgeDto>> AwardAfterFartEventAsync(Guid userId, Guid fartEventId, CancellationToken cancellationToken)
    {
        var fartEvent = await dbContext.FartEvents
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == fartEventId && x.UserId == userId, cancellationToken);
        if (fartEvent is null)
        {
            return Array.Empty<UserBadgeDto>();
        }

        var userEventCount = await dbContext.FartEvents.CountAsync(x => x.UserId == userId, cancellationToken);
        var candidates = new List<string>();

        if (userEventCount == 1)
        {
            candidates.Add("first-fart");
        }

        if (fartEvent.GasLevel >= 110)
        {
            candidates.Add("gaz-noble");
        }

        if (string.Equals(fartEvent.Category, "mythic", StringComparison.OrdinalIgnoreCase))
        {
            candidates.Add("category-5");
        }

        if (fartEvent.AudioLevel <= 35 && fartEvent.OfficialScore >= 60)
        {
            candidates.Add("silent-assassin");
        }

        if (userEventCount >= 25)
        {
            candidates.Add("king-of-farts");
        }

        if (candidates.Count == 0)
        {
            return Array.Empty<UserBadgeDto>();
        }

        var badges = await dbContext.Badges
            .Where(badge => badge.IsActive && candidates.Contains(badge.Code))
            .ToListAsync(cancellationToken);

        if (badges.Count == 0)
        {
            return Array.Empty<UserBadgeDto>();
        }

        var existingBadgeIds = await dbContext.UserBadges
            .Where(userBadge => userBadge.UserId == userId && badges.Select(badge => badge.Id).Contains(userBadge.BadgeId))
            .Select(userBadge => userBadge.BadgeId)
            .ToListAsync(cancellationToken);

        var newUserBadges = new List<UserBadge>();
        foreach (var badge in badges.Where(badge => !existingBadgeIds.Contains(badge.Id)))
        {
            newUserBadges.Add(new UserBadge
            {
                BadgeId = badge.Id,
                EarnedAt = DateTimeOffset.UtcNow,
                SourceFartEventId = fartEventId,
                UserId = userId,
            });
        }

        if (newUserBadges.Count > 0)
        {
            dbContext.UserBadges.AddRange(newUserBadges);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        var awardedIds = newUserBadges.Select(userBadge => userBadge.Id).ToHashSet();
        return await dbContext.UserBadges
            .AsNoTracking()
            .Where(userBadge => awardedIds.Contains(userBadge.Id))
            .Select(userBadge => new UserBadgeDto(
                userBadge.Id,
                userBadge.BadgeId,
                userBadge.Badge!.Code,
                userBadge.Badge.Name,
                userBadge.Badge.Description,
                userBadge.Badge.Rarity.ToString().ToLowerInvariant(),
                userBadge.Badge.IconKey,
                userBadge.SourceFartEventId,
                userBadge.EarnedAt))
            .ToListAsync(cancellationToken);
    }
}
