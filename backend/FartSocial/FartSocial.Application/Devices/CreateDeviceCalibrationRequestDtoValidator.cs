using FartSocial.Application.Devices.Dtos;
using FluentValidation;

namespace FartSocial.Application.Devices;

public sealed class CreateDeviceCalibrationRequestDtoValidator : AbstractValidator<CreateDeviceCalibrationRequestDto>
{
    public CreateDeviceCalibrationRequestDtoValidator()
    {
        RuleFor(x => x.AudioOffsetDb).InclusiveBetween(-100m, 100m);
        RuleFor(x => x.GasOffsetKohm).InclusiveBetween(-1000m, 1000m);
        RuleFor(x => x.Notes).MaximumLength(500);
    }
}
