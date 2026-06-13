using FluentValidation;
using FartSocial.Application.Social.Dtos;

namespace FartSocial.Application.Social;

public sealed class CreateCommentRequestDtoValidator : AbstractValidator<CreateCommentRequestDto>
{
    public CreateCommentRequestDtoValidator()
    {
        RuleFor(request => request.Content)
            .NotEmpty()
            .MaximumLength(1000);
    }
}
