using FartSocial.Application.Badges.Dtos;

namespace FartSocial.Application.Badges;

public interface IBadgeService
{
    Task<IReadOnlyCollection<BadgeDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<IReadOnlyCollection<UserBadgeDto>> GetMyBadgesAsync(Guid userId, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<UserBadgeDto>> AwardAfterFartEventAsync(Guid userId, Guid fartEventId, CancellationToken cancellationToken);
}
