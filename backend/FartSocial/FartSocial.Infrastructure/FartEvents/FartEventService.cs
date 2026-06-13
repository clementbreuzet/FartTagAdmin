using System.Text.Json;
using FartSocial.Application.Badges;
using FartSocial.Application.FartEvents;
using FartSocial.Application.FartEvents.Dtos;
using FartSocial.Application.Social.Dtos;
using FartSocial.Domain.Devices;
using FartSocial.Domain.FartEvents;
using FartSocial.Domain.Social;
using FartSocial.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FartSocial.Infrastructure.FartEvents;

public sealed class FartEventService(FartSocialDbContext dbContext, IBadgeService badgeService) : IFartEventService, IFartEventReadService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<FartEventDto> CreateAsync(Guid userId, CreateFartEventRequestDto request, CancellationToken cancellationToken)
    {
        var deviceIsOwned = await dbContext.DeviceOwnerships.AnyAsync(
            ownership => ownership.DeviceId == request.DeviceId && ownership.UserId == userId && ownership.IsActive,
            cancellationToken);
        if (!deviceIsOwned)
        {
            throw new UnauthorizedAccessException("Ce device n'est pas rattaché à cet utilisateur.");
        }

        FartAudioFile? audioFile = null;
        if (request.AudioFileId.HasValue)
        {
            audioFile = await dbContext.FartAudioFiles.FirstOrDefaultAsync(
                file => file.Id == request.AudioFileId.Value && file.UserId == userId,
                cancellationToken);
            if (audioFile is null)
            {
                throw new InvalidOperationException("Le fichier audio fourni est invalide.");
            }
        }

        var calculated = CalculateClassification(request);
        var fartEvent = new FartEvent
        {
            AudioFileId = audioFile?.Id,
            AudioLevel = request.AudioLevel,
            AuthenticityScore = calculated.Authenticity,
            BadgesJson = JsonSerializer.Serialize(calculated.Badges, JsonOptions),
            Category = calculated.Category,
            DeviceId = request.DeviceId,
            DurationMs = request.DurationMs,
            GasLevel = request.GasLevel,
            IsAuthenticated = calculated.IsAuthenticated,
            LocalScore = request.LocalScore,
            OfficialScore = calculated.OfficialScore,
            OccurredAt = request.Timestamp,
            RewardsJson = JsonSerializer.Serialize(calculated.Rewards, JsonOptions),
            Temperature = request.Temperature,
            UserId = userId,
            Visibility = FartVisibility.Private,
        };

        dbContext.FartEvents.Add(fartEvent);
        await dbContext.SaveChangesAsync(cancellationToken);
        await badgeService.AwardAfterFartEventAsync(userId, fartEvent.Id, cancellationToken);

        return await MapDtoAsync(fartEvent.Id, userId, cancellationToken)
            ?? throw new InvalidOperationException("L'événement n'a pas pu être créé.");
    }

    public async Task<IReadOnlyCollection<FartHistoryItemDto>> GetMyHistoryAsync(Guid userId, CancellationToken cancellationToken)
    {
        var events = await dbContext.FartEvents
            .Where(eventItem => eventItem.UserId == userId)
            .OrderByDescending(eventItem => eventItem.OccurredAt)
            .ToListAsync(cancellationToken);

        var history = new List<FartHistoryItemDto>(events.Count);
        foreach (var eventItem in events)
        {
            history.Add(new FartHistoryItemDto(
                eventItem.Id,
                eventItem.OccurredAt,
                eventItem.OfficialScore,
                eventItem.DurationMs,
                eventItem.AudioLevel,
                eventItem.GasLevel,
                eventItem.Temperature,
                eventItem.IsAuthenticated,
                eventItem.Category,
                eventItem.Visibility.ToString().ToLowerInvariant(),
                await GetReactionSummaryAsync(eventItem.Id, userId, cancellationToken)));
        }

        return history;
    }

    public async Task<FartEventDto?> GetByIdAsync(Guid userId, Guid fartEventId, CancellationToken cancellationToken)
    {
        return await MapDtoAsync(fartEventId, userId, cancellationToken);
    }

    public async Task<FartEventDto?> UpdateVisibilityAsync(Guid userId, Guid fartEventId, UpdateFartVisibilityRequestDto request, CancellationToken cancellationToken)
    {
        var fartEvent = await dbContext.FartEvents.FirstOrDefaultAsync(x => x.Id == fartEventId && x.UserId == userId, cancellationToken);
        if (fartEvent is null)
        {
            return null;
        }

        fartEvent.Visibility = request.IsPublic ? FartVisibility.Public : FartVisibility.Private;
        fartEvent.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return await MapDtoAsync(fartEventId, userId, cancellationToken);
    }

    public async Task<FartEventDto?> ReactAsync(Guid userId, Guid fartEventId, ReactToFartRequestDto request, CancellationToken cancellationToken)
    {
        var fartEvent = await dbContext.FartEvents.FirstOrDefaultAsync(
            x => x.Id == fartEventId && (x.UserId == userId || x.Visibility == FartVisibility.Public),
            cancellationToken);
        if (fartEvent is null)
        {
            return null;
        }

        if (!Enum.TryParse<FartReactionType>(request.ReactionType, true, out var reactionType))
        {
            throw new InvalidOperationException("Réaction invalide.");
        }

        var existing = await dbContext.Reactions.FirstOrDefaultAsync(x => x.FartEventId == fartEventId && x.UserId == userId, cancellationToken);
        if (existing is null)
        {
            dbContext.Reactions.Add(new Reaction
            {
                FartEventId = fartEventId,
                ReactedAt = DateTimeOffset.UtcNow,
                ReactionType = reactionType,
                UserId = userId,
            });
        }
        else
        {
            existing.ReactionType = reactionType;
            existing.ReactedAt = DateTimeOffset.UtcNow;
            existing.UpdatedAt = DateTimeOffset.UtcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return await MapDtoAsync(fartEventId, userId, cancellationToken);
    }

    public async Task<CommentDto?> CommentAsync(Guid userId, Guid fartEventId, CreateCommentRequestDto request, CancellationToken cancellationToken)
    {
        var fartEvent = await dbContext.FartEvents.FirstOrDefaultAsync(
            x => x.Id == fartEventId && (x.UserId == userId || x.Visibility == FartVisibility.Public),
            cancellationToken);
        if (fartEvent is null)
        {
            return null;
        }

        var content = request.Content.Trim();
        if (string.IsNullOrWhiteSpace(content))
        {
            throw new InvalidOperationException("Le commentaire ne peut pas être vide.");
        }

        var comment = new Comment
        {
            CommentedAt = DateTimeOffset.UtcNow,
            Content = content,
            FartEventId = fartEventId,
            UserId = userId,
        };

        dbContext.Comments.Add(comment);
        await dbContext.SaveChangesAsync(cancellationToken);

        var user = await dbContext.Users.AsNoTracking().FirstAsync(x => x.Id == userId, cancellationToken);
        return new CommentDto(
            comment.Id,
            fartEventId,
            user.Id,
            user.UserName,
            user.AvatarUrl,
            comment.Content,
            comment.CommentedAt);
    }

    private async Task<FartEventDto?> MapDtoAsync(Guid fartEventId, Guid viewerUserId, CancellationToken cancellationToken)
    {
        var fartEvent = await dbContext.FartEvents.FirstOrDefaultAsync(
            x => x.Id == fartEventId && (x.UserId == viewerUserId || x.Visibility == FartVisibility.Public),
            cancellationToken);
        if (fartEvent is null)
        {
            return null;
        }

        var rewards = DeserializeRewards(fartEvent.RewardsJson);
        var badges = DeserializeBadges(fartEvent.BadgesJson);
        return new FartEventDto(
            fartEvent.Id,
            fartEvent.UserId,
            fartEvent.DeviceId,
            fartEvent.AudioFileId,
            fartEvent.OccurredAt,
            fartEvent.AudioLevel,
            fartEvent.GasLevel,
            fartEvent.Temperature,
            fartEvent.DurationMs,
            fartEvent.LocalScore,
            fartEvent.OfficialScore,
            fartEvent.AuthenticityScore,
            fartEvent.IsAuthenticated,
            fartEvent.Category,
            fartEvent.Visibility,
            rewards,
            badges,
            await GetReactionSummaryAsync(fartEvent.Id, viewerUserId, cancellationToken));
    }

    private static (int OfficialScore, int Authenticity, string Category, bool IsAuthenticated, List<FartRewardDto> Rewards, List<string> Badges) CalculateClassification(CreateFartEventRequestDto request)
    {
        var durationScore = Math.Clamp(request.DurationMs / 120, 0, 120);
        var sensorBlend = (request.AudioLevel * 0.35m) + (request.GasLevel * 0.45m) + (request.Temperature * 0.2m);
        var officialScore = Math.Clamp((int)Math.Round(request.LocalScore * 0.45m + sensorBlend * 0.35m + durationScore * 0.2m), 0, 100);
        var authenticity = Math.Clamp((int)Math.Round(100 - Math.Abs(request.AudioLevel - request.GasLevel / 12m) - Math.Abs(request.Temperature - 24m) * 1.5m), 0, 100);
        var isAuthenticated = authenticity >= 70 && officialScore >= 35;
        var category = officialScore switch
        {
            >= 95 => "mythic",
            >= 85 => "legendary",
            >= 70 => "epic",
            >= 50 => "rare",
            _ => "common",
        };

        var rewards = new List<FartRewardDto>();
        var badges = new List<string>();

        if (officialScore >= 50)
        {
            rewards.Add(new FartRewardDto("flatulons", "Flatulons", officialScore * 2));
        }
        if (officialScore >= 70)
        {
            rewards.Add(new FartRewardDto("cosmetic", "Cosmétique néon", 1));
            badges.Add("Authentifié");
        }
        if (officialScore >= 85)
        {
            rewards.Add(new FartRewardDto("badge", "Badge rare", 1));
            badges.Add("Legendary Breath");
        }
        if (officialScore >= 95)
        {
            rewards.Add(new FartRewardDto("badge", "Badge mythique", 1));
            badges.Add("Mythic Eruption");
        }

        return (officialScore, authenticity, category, isAuthenticated, rewards, badges);
    }

    private async Task<FartReactionSummaryDto> GetReactionSummaryAsync(Guid fartEventId, Guid viewerUserId, CancellationToken cancellationToken)
    {
        var reactions = await dbContext.Reactions
            .Where(reaction => reaction.FartEventId == fartEventId)
            .ToListAsync(cancellationToken);

        var viewerReactionEntity = reactions.FirstOrDefault(reaction => reaction.UserId == viewerUserId);
        var viewerReaction = viewerReactionEntity is null
            ? null
            : viewerReactionEntity.ReactionType.ToString().ToLowerInvariant();

        return new FartReactionSummaryDto(
            reactions.Count(reaction => reaction.ReactionType == FartReactionType.Fire),
            reactions.Count(reaction => reaction.ReactionType == FartReactionType.Laugh),
            reactions.Count(reaction => reaction.ReactionType == FartReactionType.Shock),
            reactions.Count(reaction => reaction.ReactionType == FartReactionType.Heart),
            string.IsNullOrWhiteSpace(viewerReaction) ? null : viewerReaction);
    }

    private static IReadOnlyCollection<FartRewardDto> DeserializeRewards(string json) =>
        JsonSerializer.Deserialize<List<FartRewardDto>>(json, JsonOptions) ?? [];

    private static IReadOnlyCollection<string> DeserializeBadges(string json) =>
        JsonSerializer.Deserialize<List<string>>(json, JsonOptions) ?? [];

}
