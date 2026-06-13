namespace FartSocial.Infrastructure.Configuration;

public sealed class SeedOptions
{
    public const string SectionName = "Seed";

    public string? SuperAdminEmail { get; set; }
    public string? SuperAdminPassword { get; set; }
    public string? SuperAdminUserName { get; set; }
}
