using FartSocial.Application.Auth.Dtos;
using FluentValidation;

namespace FartSocial.Application.Validation;

public sealed class RefreshTokenRequestDtoValidator : AbstractValidator<RefreshTokenRequestDto>
{
    public RefreshTokenRequestDtoValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}
