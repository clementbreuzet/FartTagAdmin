namespace FartSocial.Application.LootBoxes.Dtos;

public sealed record LootBoxDto(
    Guid Id,
    string Name,
    string Description,
    int PriceFlatulons,
    bool IsActive,
    IReadOnlyCollection<LootBoxRewardDto> Rewards);
