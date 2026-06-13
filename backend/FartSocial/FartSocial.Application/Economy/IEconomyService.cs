using FartSocial.Application.Economy.Dtos;

namespace FartSocial.Application.Economy;

public interface IEconomyService
{
    Task<WalletDto> GetWalletAsync(Guid userId, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<WalletTransactionDto>> GetTransactionsAsync(Guid userId, CancellationToken cancellationToken);
    Task<decimal> GetBalanceAsync(Guid userId, CancellationToken cancellationToken);
    Task<WalletTransactionDto> CreditFlatulonsAsync(Guid userId, CreditFlatulonsRequestDto request, Guid? actorUserId, CancellationToken cancellationToken);
    Task<WalletTransactionDto> DebitFlatulonsAsync(Guid userId, DebitFlatulonsRequestDto request, Guid? actorUserId, CancellationToken cancellationToken);
}
