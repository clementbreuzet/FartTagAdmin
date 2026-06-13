using FartSocial.Application.Auth.Dtos;
using FluentValidation;

namespace FartSocial.Application.Validation;

public sealed class LogoutRequestDtoValidator : AbstractValidator<LogoutRequestDto>
{
    public LogoutRequestDtoValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}
