namespace FartSocial.Application.Economy.Dtos;

public sealed record WalletTransactionDto(
    Guid Id,
    Guid WalletId,
    decimal Amount,
    string Type,
    string Reason,
    string? ReferenceType,
    string? ReferenceId,
    Guid? CreatedByUserId,
    DateTimeOffset TransactionAt);
