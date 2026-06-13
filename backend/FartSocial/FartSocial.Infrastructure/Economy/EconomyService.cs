using FartSocial.Application.Economy;
using FartSocial.Application.Economy.Dtos;
using FartSocial.Domain.Economy;
using FartSocial.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FartSocial.Infrastructure.Economy;

public sealed class EconomyService(FartSocialDbContext dbContext) : IEconomyService
{
    public async Task<WalletDto> GetWalletAsync(Guid userId, CancellationToken cancellationToken)
    {
        var wallet = await GetOrCreateWalletAsync(userId, cancellationToken);
        var balance = await GetBalanceAsync(userId, cancellationToken);
        return new WalletDto(wallet.Id, wallet.UserId, wallet.Currency, balance, wallet.CreatedAt);
    }

    public async Task<IReadOnlyCollection<WalletTransactionDto>> GetTransactionsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var wallet = await GetOrCreateWalletAsync(userId, cancellationToken);
        return await dbContext.WalletTransactions
            .Where(transaction => transaction.WalletId == wallet.Id)
            .OrderByDescending(transaction => transaction.TransactionAt)
            .Select(transaction => new WalletTransactionDto(
                transaction.Id,
                transaction.WalletId,
                transaction.Amount,
                transaction.Type.ToString().ToLowerInvariant(),
                transaction.Reason,
                transaction.ReferenceType,
                transaction.ReferenceId,
                transaction.CreatedByUserId,
                transaction.TransactionAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<decimal> GetBalanceAsync(Guid userId, CancellationToken cancellationToken)
    {
        var wallet = await GetOrCreateWalletAsync(userId, cancellationToken);
        return await dbContext.WalletTransactions
            .Where(transaction => transaction.WalletId == wallet.Id)
            .SumAsync(transaction => transaction.Type == WalletTransactionType.Credit ? transaction.Amount : -transaction.Amount, cancellationToken);
    }

    public async Task<WalletTransactionDto> CreditFlatulonsAsync(Guid userId, CreditFlatulonsRequestDto request, Guid? actorUserId, CancellationToken cancellationToken)
    {
        var wallet = await GetOrCreateWalletAsync(userId, cancellationToken);
        var transaction = new WalletTransaction
        {
            Amount = request.Amount,
            CreatedByUserId = actorUserId,
            Reason = request.Reason.Trim(),
            ReferenceId = request.ReferenceId?.Trim(),
            ReferenceType = request.ReferenceType?.Trim(),
            TransactionAt = DateTimeOffset.UtcNow,
            Type = WalletTransactionType.Credit,
            WalletId = wallet.Id,
        };

        dbContext.WalletTransactions.Add(transaction);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToDto(transaction);
    }

    public async Task<WalletTransactionDto> DebitFlatulonsAsync(Guid userId, DebitFlatulonsRequestDto request, Guid? actorUserId, CancellationToken cancellationToken)
    {
        var wallet = await GetOrCreateWalletAsync(userId, cancellationToken);
        var balance = await GetBalanceAsync(userId, cancellationToken);
        if (balance < request.Amount)
        {
            throw new InvalidOperationException("Solde insuffisant.");
        }

        var transaction = new WalletTransaction
        {
            Amount = request.Amount,
            CreatedByUserId = actorUserId,
            Reason = request.Reason.Trim(),
            ReferenceId = request.ReferenceId?.Trim(),
            ReferenceType = request.ReferenceType?.Trim(),
            TransactionAt = DateTimeOffset.UtcNow,
            Type = WalletTransactionType.Debit,
            WalletId = wallet.Id,
        };

        dbContext.WalletTransactions.Add(transaction);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToDto(transaction);
    }

    public async Task<WalletTransactionDto> CreditFlatulonsInternalAsync(
        Guid userId,
        decimal amount,
        string reason,
        string? referenceType,
        string? referenceId,
        Guid? actorUserId,
        CancellationToken cancellationToken)
    {
        var wallet = await GetOrCreateWalletAsync(userId, cancellationToken);
        var transaction = new WalletTransaction
        {
            Amount = amount,
            CreatedByUserId = actorUserId,
            Reason = reason.Trim(),
            ReferenceId = referenceId?.Trim(),
            ReferenceType = referenceType?.Trim(),
            TransactionAt = DateTimeOffset.UtcNow,
            Type = WalletTransactionType.Credit,
            WalletId = wallet.Id,
        };

        dbContext.WalletTransactions.Add(transaction);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToDto(transaction);
    }

    private async Task<Wallet> GetOrCreateWalletAsync(Guid userId, CancellationToken cancellationToken)
    {
        var wallet = await dbContext.Wallets.FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        if (wallet is not null)
        {
            return wallet;
        }

        wallet = new Wallet
        {
            Currency = "FLATULONS",
            UserId = userId,
        };

        dbContext.Wallets.Add(wallet);
        await dbContext.SaveChangesAsync(cancellationToken);
        return wallet;
    }

    private static WalletTransactionDto ToDto(WalletTransaction transaction) =>
        new(
            transaction.Id,
            transaction.WalletId,
            transaction.Amount,
            transaction.Type.ToString().ToLowerInvariant(),
            transaction.Reason,
            transaction.ReferenceType,
            transaction.ReferenceId,
            transaction.CreatedByUserId,
            transaction.TransactionAt);
}
