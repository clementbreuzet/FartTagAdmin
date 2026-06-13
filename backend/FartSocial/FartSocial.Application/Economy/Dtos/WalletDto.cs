namespace FartSocial.Application.Economy.Dtos;

public sealed record WalletDto(
    Guid Id,
    Guid UserId,
    string Currency,
    decimal Balance,
    DateTimeOffset CreatedAt);
