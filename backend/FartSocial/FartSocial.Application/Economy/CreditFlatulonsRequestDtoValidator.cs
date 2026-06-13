using FartSocial.Application.Economy.Dtos;
using FluentValidation;

namespace FartSocial.Application.Economy;

public sealed class CreditFlatulonsRequestDtoValidator : AbstractValidator<CreditFlatulonsRequestDto>
{
    public CreditFlatulonsRequestDtoValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0m).LessThanOrEqualTo(1_000_000m);
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(250);
        RuleFor(x => x.ReferenceType).MaximumLength(100);
        RuleFor(x => x.ReferenceId).MaximumLength(100);
    }
}
