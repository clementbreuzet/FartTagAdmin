namespace FartSocial.Application.Economy.Dtos;

public sealed record DebitFlatulonsRequestDto(
    decimal Amount,
    string Reason,
    string? ReferenceType,
    string? ReferenceId);
