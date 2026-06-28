namespace FartSocial.Application.Progression.Dtos;

public sealed record ProgressionSnapshotDto(
    int Level,
    int TotalXp,
    int CurrentLevelXp,
    int RequiredLevelXp,
    int ProgressPercent);
