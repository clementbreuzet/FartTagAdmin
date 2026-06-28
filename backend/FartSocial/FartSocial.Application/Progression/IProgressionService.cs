using FartSocial.Application.Progression.Dtos;
using FartSocial.Domain.FartEvents;
using FartSocial.Domain.Identity;

namespace FartSocial.Application.Progression;

public interface IProgressionService
{
    FartRewardsDto ApplyFartRewards(User user, FartEvent fartEvent);
    ProgressionSnapshotDto GetSnapshot(int totalXp);
    int GetRequiredXpForLevel(int level);
}
