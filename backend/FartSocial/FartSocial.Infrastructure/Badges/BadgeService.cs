using FartSocial.Application.Badges;
using FartSocial.Application.Badges.Dtos;

namespace FartSocial.Infrastructure.Badges;

public sealed class BadgeService : IBadgeService
{
    public Task<IReadOnlyCollection<BadgeDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return Task.FromResult<IReadOnlyCollection<BadgeDto>>(Array.Empty<BadgeDto>());
    }

    public Task<IReadOnlyCollection<UserBadgeDto>> GetMyBadgesAsync(Guid userId, CancellationToken cancellationToken)
    {
        return Task.FromResult<IReadOnlyCollection<UserBadgeDto>>(Array.Empty<UserBadgeDto>());
    }

    public Task<IReadOnlyCollection<UserBadgeDto>> AwardAfterFartEventAsync(Guid userId, Guid fartEventId, CancellationToken cancellationToken)
    {
        return Task.FromResult<IReadOnlyCollection<UserBadgeDto>>(Array.Empty<UserBadgeDto>());
    }
}
