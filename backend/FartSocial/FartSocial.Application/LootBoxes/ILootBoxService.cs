using FartSocial.Application.LootBoxes.Dtos;

namespace FartSocial.Application.LootBoxes;

public interface ILootBoxService
{
    Task<IReadOnlyCollection<LootBoxDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<OpenLootBoxResultDto?> OpenAsync(Guid userId, Guid lootBoxId, CancellationToken cancellationToken);
}
