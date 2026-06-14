using FartSocial.Application.FartEvents.Dtos;
using FluentValidation;

namespace FartSocial.Application.FartEvents;

public sealed class CreateFartEventRequestDtoValidator : AbstractValidator<CreateFartEventRequestDto>
{
    public CreateFartEventRequestDtoValidator()
    {
        RuleFor(x => x.DeviceId).NotEmpty().When(x => x.DeviceId.HasValue);
        RuleFor(x => x.Timestamp).NotEmpty();
        RuleFor(x => x.AudioLevel).InclusiveBetween(0, 200);
        RuleFor(x => x.GasLevel).InclusiveBetween(0, 1000);
        RuleFor(x => x.Temperature).InclusiveBetween(-40m, 100m);
        RuleFor(x => x.DurationMs).InclusiveBetween(1, 600_000);
        RuleFor(x => x.LocalScore).InclusiveBetween(0, 1000);
    }
}
