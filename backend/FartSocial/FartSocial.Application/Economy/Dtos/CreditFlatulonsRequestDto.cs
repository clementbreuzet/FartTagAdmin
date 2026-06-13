namespace FartSocial.Application.Economy.Dtos;

public sealed record CreditFlatulonsRequestDto(
    decimal Amount,
    string Reason,
    string? ReferenceType,
    string? ReferenceId);
