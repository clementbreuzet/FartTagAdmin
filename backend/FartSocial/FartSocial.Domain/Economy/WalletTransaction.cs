using FartSocial.Domain.Common;

namespace FartSocial.Domain.Economy;

public sealed class WalletTransaction : Entity
{
    public Guid WalletId { get; set; }
    public decimal Amount { get; set; }
    public WalletTransactionType Type { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? ReferenceType { get; set; }
    public string? ReferenceId { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public DateTimeOffset TransactionAt { get; set; } = DateTimeOffset.UtcNow;

    public Wallet? Wallet { get; set; }
}
