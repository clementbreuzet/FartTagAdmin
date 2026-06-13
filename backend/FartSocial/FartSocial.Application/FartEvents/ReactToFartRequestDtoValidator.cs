using FartSocial.Application.FartEvents.Dtos;
using FluentValidation;

namespace FartSocial.Application.FartEvents;

public sealed class ReactToFartRequestDtoValidator : AbstractValidator<ReactToFartRequestDto>
{
    public ReactToFartRequestDtoValidator()
    {
        RuleFor(x => x.ReactionType)
            .NotEmpty()
            .Must(value => new[] { "fire", "laugh", "shock", "heart" }.Contains(value.ToLowerInvariant()));
    }
}
