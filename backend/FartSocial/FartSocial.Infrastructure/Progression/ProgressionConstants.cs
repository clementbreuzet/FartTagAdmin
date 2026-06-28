namespace FartSocial.Infrastructure.Progression;

internal static class ProgressionConstants
{
    public const string FartEventReferenceType = "fart-event";
    public const string FartValidationRewardReason = "fart-validation";
    public const string WalletCurrency = "FLATULONS";

    public static readonly IReadOnlyDictionary<string, int> CategoryRanks =
        new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
        {
            ["common"] = 1,
            ["rare"] = 2,
            ["epic"] = 3,
            ["legendary"] = 4,
            ["mythic"] = 5,
        };

    public static readonly IReadOnlyDictionary<int, int> CategoryXpBonus =
        new Dictionary<int, int>
        {
            [1] = 0,
            [2] = 5,
            [3] = 15,
            [4] = 35,
            [5] = 75,
        };

    public static readonly IReadOnlyDictionary<int, int> CategoryFlatulonsBonus =
        new Dictionary<int, int>
        {
            [1] = 1,
            [2] = 3,
            [3] = 7,
            [4] = 15,
            [5] = 30,
        };
}
