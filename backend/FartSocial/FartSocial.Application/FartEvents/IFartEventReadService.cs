using FartSocial.Application.FartEvents.Dtos;

namespace FartSocial.Application.FartEvents;

public interface IFartEventReadService
{
    Task<IReadOnlyCollection<FartHistoryItemDto>> GetMyHistoryAsync(Guid userId, CancellationToken cancellationToken);
    Task<FartEventDto?> GetByIdAsync(Guid userId, Guid fartEventId, CancellationToken cancellationToken);
}
