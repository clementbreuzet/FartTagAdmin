using System.Security.Claims;
using FartSocial.Application.Economy;
using FartSocial.Application.Economy.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FartSocial.Api.Controllers;

/// <summary>
/// Provides the authenticated user's Flatulons wallet and transaction history.
/// </summary>
/// <param name="economyService">The economy service.</param>
[ApiController]
[Authorize]
[Route("api/wallet")]
public sealed class WalletController(IEconomyService economyService) : ControllerBase
{
    /// <summary>Gets the authenticated user's Flatulons wallet.</summary>
    [HttpGet]
    public async Task<ActionResult<WalletDto>> GetWallet(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var wallet = await economyService.GetWalletAsync(userId.Value, cancellationToken);
        return Ok(wallet);
    }

    /// <summary>Gets the authenticated user's append-only wallet transactions.</summary>
    [HttpGet("transactions")]
    public async Task<ActionResult<IReadOnlyCollection<WalletTransactionDto>>> GetTransactions(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var transactions = await economyService.GetTransactionsAsync(userId.Value, cancellationToken);
        return Ok(transactions);
    }

    private Guid? GetUserId()
    {
        var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(rawUserId, out var userId) ? userId : null;
    }
}
