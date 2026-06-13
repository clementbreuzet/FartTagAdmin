using FartSocial.Domain.Common;

namespace FartSocial.Domain.Economy;

public sealed class Wallet : Entity
{
    public Guid UserId { get; set; }
    public string Currency { get; set; } = "FLATULONS";

    public ICollection<WalletTransaction> Transactions { get; set; } = new List<WalletTransaction>();
}
