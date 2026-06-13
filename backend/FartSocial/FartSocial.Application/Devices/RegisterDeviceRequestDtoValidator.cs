using FartSocial.Application.Devices.Dtos;
using FluentValidation;

namespace FartSocial.Application.Devices;

public sealed class RegisterDeviceRequestDtoValidator : AbstractValidator<RegisterDeviceRequestDto>
{
    public RegisterDeviceRequestDtoValidator()
    {
        RuleFor(x => x.SerialNumber).NotEmpty().MaximumLength(80);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Model).NotEmpty().MaximumLength(80);
        RuleFor(x => x.FirmwareVersion).MaximumLength(40);
        RuleFor(x => x.BleMacAddress).MaximumLength(32);
    }
}
