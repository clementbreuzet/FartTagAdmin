using FartSocial.Application.FartEvents.Dtos;
using FartSocial.Application.Social.Dtos;

namespace FartSocial.Application.FartEvents;

public interface IFartEventReadService
{
    Task<IReadOnlyCollection<FartHistoryItemDto>> GetMyHistoryAsync(Guid userId, CancellationToken cancellationToken);
    Task<FartEventDto?> GetByIdAsync(Guid userId, Guid fartEventId, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<CommentDto>?> GetCommentsAsync(Guid userId, Guid fartEventId, CancellationToken cancellationToken);
}
