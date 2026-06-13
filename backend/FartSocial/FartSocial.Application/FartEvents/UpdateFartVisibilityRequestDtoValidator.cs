using FartSocial.Application.FartEvents.Dtos;
using FluentValidation;

namespace FartSocial.Application.FartEvents;

public sealed class UpdateFartVisibilityRequestDtoValidator : AbstractValidator<UpdateFartVisibilityRequestDto>
{
    public UpdateFartVisibilityRequestDtoValidator()
    {
        RuleFor(x => x.IsPublic).NotNull();
    }
}
