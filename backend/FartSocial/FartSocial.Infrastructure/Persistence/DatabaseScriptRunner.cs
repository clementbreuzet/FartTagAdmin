using System.Text.RegularExpressions;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FartSocial.Infrastructure.Persistence;

public sealed class DatabaseScriptRunner(
    IConfiguration configuration,
    ILogger<DatabaseScriptRunner> logger)
{
    private static readonly Regex BatchSeparator = new(
        @"^\s*GO\s*(?:--.*)?$",
        RegexOptions.IgnoreCase | RegexOptions.Multiline | RegexOptions.CultureInvariant);

    private static readonly string[] OrderedScripts =
    [
        "000_create_database.sql",
        "001_schema.sql",
        "005_upgrade_user_data_and_audio_blob.sql",
        "007_upgrade_user_progression.sql",
        "010_seed_security_and_badges.sql",
        "020_seed_shop_catalog.sql",
        "900_verify_deployment.sql",
    ];

    public async Task RunAsync(CancellationToken cancellationToken)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is required.");
        var builder = new SqlConnectionStringBuilder(connectionString);
        var databaseName = string.IsNullOrWhiteSpace(builder.InitialCatalog)
            ? "FartSocial"
            : builder.InitialCatalog;

        builder.InitialCatalog = "master";
        var scriptsDirectory = FindScriptsDirectory();

        await using var connection = new SqlConnection(builder.ConnectionString);
        await connection.OpenAsync(cancellationToken);

        foreach (var scriptName in OrderedScripts)
        {
            var scriptPath = Path.Combine(scriptsDirectory, scriptName);
            logger.LogInformation("Applying database script {ScriptName}", scriptName);
            var script = await File.ReadAllTextAsync(scriptPath, cancellationToken);
            script = PrepareScript(script, databaseName);

            foreach (var batch in SplitBatches(script))
            {
                await using var command = connection.CreateCommand();
                command.CommandText = batch;
                command.CommandTimeout = 120;
                await command.ExecuteNonQueryAsync(cancellationToken);
            }
        }
    }

    private static string PrepareScript(string script, string databaseName)
    {
        var prepared = script.Replace("$(DatabaseName)", databaseName, StringComparison.Ordinal);
        var lines = prepared
            .Split(["\r\n", "\n"], StringSplitOptions.None)
            .Where(line => !line.TrimStart().StartsWith(":setvar", StringComparison.OrdinalIgnoreCase));
        return string.Join(Environment.NewLine, lines);
    }

    private static IEnumerable<string> SplitBatches(string script) =>
        BatchSeparator
            .Split(script)
            .Select(batch => batch.Trim())
            .Where(batch => !string.IsNullOrWhiteSpace(batch));

    private static string FindScriptsDirectory()
    {
        var candidates = EnumerateCandidateRoots()
            .Select(root => Path.Combine(root, "database", "scripts"))
            .Where(Directory.Exists)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        return candidates.FirstOrDefault()
            ?? throw new DirectoryNotFoundException("Could not find database/scripts from the application startup path.");
    }

    private static IEnumerable<string> EnumerateCandidateRoots()
    {
        foreach (var start in new[] { Directory.GetCurrentDirectory(), AppContext.BaseDirectory })
        {
            var directory = new DirectoryInfo(start);
            while (directory is not null)
            {
                yield return directory.FullName;
                directory = directory.Parent;
            }
        }
    }
}
