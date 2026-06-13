using FartSocial.Application.Inventory.Dtos;

namespace FartSocial.Application.Inventory;

public interface IInventoryService
{
    Task<InventoryResponseDto> GetMyInventoryAsync(Guid userId, CancellationToken cancellationToken);
    Task<InventoryResponseDto?> EquipAsync(Guid userId, Guid itemId, CancellationToken cancellationToken);
}
