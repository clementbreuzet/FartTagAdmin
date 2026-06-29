using FartSocial.Application.Auth.Dtos;
using FluentValidation;

namespace FartSocial.Application.Validation;

public sealed class RegisterRequestDtoValidator : AbstractValidator<RegisterRequestDto>
{
    public RegisterRequestDtoValidator()
    {
        RuleFor(x => x.UserName).NotEmpty().MinimumLength(3).MaximumLength(50);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(254);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8).MaximumLength(128);
        RuleFor(x => x.Continent).MaximumLength(80);
        RuleFor(x => x.Country).MaximumLength(120);
        RuleFor(x => x.City).MaximumLength(120);
    }
}
