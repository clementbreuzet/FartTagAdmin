namespace FartSocial.Application.Progression.Dtos;

public sealed record FartRewardsDto(
    int XpGained,
    int FlatulonsGained,
    int OldLevel,
    int NewLevel,
    bool LeveledUp,
    int TotalXp,
    int CurrentLevelXp,
    int RequiredLevelXp,
    int ProgressPercent,
    int OldFlatulons,
    int NewFlatulons);
