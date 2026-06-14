# FartSocial.Api

ASP.NET Core backend for FartSocial and FartTag Admin.

## Requirements

- .NET SDK 10.0.301 or a later .NET 10 feature band
- SQL Server 2019 or later, or SQL Server Express

## Local SQL Server

Development uses the local SQL Express instance:

```text
Server=localhost\SQLEXPRESS;Database=FartSocial;Trusted_Connection=True;TrustServerCertificate=True
```

The connection is stored only in `appsettings.Development.json`. Deploy the
database first using the scripts from `database/scripts`.

## Azure Key Vault

Set `KeyVault:Uri` through an environment variable or deployed configuration:

```text
KeyVault__Uri=https://YOUR-VAULT.vault.azure.net/
```

Create this Key Vault secret:

```text
ConnectionStrings--DefaultConnection
```

ASP.NET configuration converts the double dash to
`ConnectionStrings:DefaultConnection`. `DefaultAzureCredential` supports a
managed identity in Azure and developer credentials locally.
