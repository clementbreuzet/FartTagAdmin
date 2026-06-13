using FartSocial.Application.Authorization;
using FartSocial.Application.Economy;
using FartSocial.Application.Economy.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FartSocial.Api.Controllers;

/// <summary>
/// Exposes administrative access to user wallets and their transactions.
/// </summary>
/// <param name="economyService">The economy service.</param>
[ApiController]
[Authorize(Policy = PolicyNames.AdminAccess)]
[Route("api/admin/wallet")]
public sealed class AdminWalletController(IEconomyService economyService) : ControllerBase
{
    /// <summary>Gets a user's Flatulons wallet.</summary>
    [HttpGet("{userId:guid}")]
    public async Task<ActionResult<WalletDto>> GetWallet(Guid userId, CancellationToken cancellationToken)
    {
        var wallet = await economyService.GetWalletAsync(userId, cancellationToken);
        return Ok(wallet);
    }

    /// <summary>Gets the append-only transaction history for a user's wallet.</summary>
    [HttpGet("{userId:guid}/transactions")]
    public async Task<ActionResult<IReadOnlyCollection<WalletTransactionDto>>> GetTransactions(Guid userId, CancellationToken cancellationToken)
    {
        var transactions = await economyService.GetTransactionsAsync(userId, cancellationToken);
        return Ok(transactions);
    }
}
