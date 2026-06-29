using System.Text.RegularExpressions;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Hosting;

namespace FartSocial.Infrastructure.Persistence;

public sealed class DatabaseScriptRunner(
    IConfiguration configuration,
    IHostEnvironment environment,
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

    private static readonly string[] DevelopmentScripts =
    [
        "030_seed_dev_user.sql",
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

        foreach (var scriptName in GetScriptsToRun())
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

            if (string.Equals(scriptName, "001_schema.sql", StringComparison.OrdinalIgnoreCase))
            {
                await EnsureUserSchemaAsync(connection, databaseName, cancellationToken);
            }
        }
    }

    private async Task EnsureUserSchemaAsync(SqlConnection connection, string databaseName, CancellationToken cancellationToken)
    {
        logger.LogInformation("Ensuring Users V0 schema columns in database {DatabaseName}", databaseName);

        connection.ChangeDatabase(databaseName);
        await ExecuteAsync(
            connection,
            "IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.Users', N'Level') IS NULL ALTER TABLE dbo.Users ADD Level int NOT NULL CONSTRAINT DF_Users_Level DEFAULT 1 WITH VALUES;",
            cancellationToken);
        await ExecuteAsync(
            connection,
            "IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.Users', N'TotalXp') IS NULL ALTER TABLE dbo.Users ADD TotalXp int NOT NULL CONSTRAINT DF_Users_TotalXp DEFAULT 0 WITH VALUES;",
            cancellationToken);
        await ExecuteAsync(
            connection,
            "IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.Users', N'Gems') IS NULL ALTER TABLE dbo.Users ADD Gems int NOT NULL CONSTRAINT DF_Users_Gems DEFAULT 0 WITH VALUES;",
            cancellationToken);
        await ExecuteAsync(
            connection,
            "IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.Users', N'Continent') IS NULL ALTER TABLE dbo.Users ADD Continent nvarchar(80) NOT NULL CONSTRAINT DF_Users_Continent DEFAULT N'Europe' WITH VALUES;",
            cancellationToken);
        await ExecuteAsync(
            connection,
            "IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.Users', N'Country') IS NULL ALTER TABLE dbo.Users ADD Country nvarchar(120) NOT NULL CONSTRAINT DF_Users_Country DEFAULT N'France' WITH VALUES;",
            cancellationToken);
        await ExecuteAsync(
            connection,
            "IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.Users', N'City') IS NULL ALTER TABLE dbo.Users ADD City nvarchar(120) NOT NULL CONSTRAINT DF_Users_City DEFAULT N'Montesson' WITH VALUES;",
            cancellationToken);
        await ExecuteAsync(
            connection,
            "IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL AND COL_LENGTH(N'dbo.Users', N'Continent') IS NOT NULL AND COL_LENGTH(N'dbo.Users', N'Country') IS NOT NULL AND COL_LENGTH(N'dbo.Users', N'City') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = N'IX_Users_Continent_Country_City') EXEC sys.sp_executesql N'CREATE INDEX IX_Users_Continent_Country_City ON dbo.Users(Continent, Country, City);';",
            cancellationToken);
        connection.ChangeDatabase("master");
    }

    private static async Task ExecuteAsync(SqlConnection connection, string commandText, CancellationToken cancellationToken)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = commandText;
        command.CommandTimeout = 120;
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private IEnumerable<string> GetScriptsToRun()
    {
        foreach (var script in OrderedScripts)
        {
            if (script == "900_verify_deployment.sql" && environment.IsDevelopment())
            {
                foreach (var developmentScript in DevelopmentScripts)
                {
                    yield return developmentScript;
                }
            }

            yield return script;
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
