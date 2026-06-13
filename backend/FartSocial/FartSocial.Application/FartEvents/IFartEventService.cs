using FartSocial.Application.FartEvents.Dtos;
using FartSocial.Application.Social.Dtos;

namespace FartSocial.Application.FartEvents;

public interface IFartEventService
{
    Task<FartEventDto> CreateAsync(Guid userId, CreateFartEventRequestDto request, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<FartHistoryItemDto>> GetMyHistoryAsync(Guid userId, CancellationToken cancellationToken);
    Task<FartEventDto?> GetByIdAsync(Guid userId, Guid fartEventId, CancellationToken cancellationToken);
    Task<FartEventDto?> UpdateVisibilityAsync(Guid userId, Guid fartEventId, UpdateFartVisibilityRequestDto request, CancellationToken cancellationToken);
    Task<FartEventDto?> ReactAsync(Guid userId, Guid fartEventId, ReactToFartRequestDto request, CancellationToken cancellationToken);
    Task<CommentDto?> CommentAsync(Guid userId, Guid fartEventId, CreateCommentRequestDto request, CancellationToken cancellationToken);
}
