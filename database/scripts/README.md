# FartSocial SQL Server Deployment

These scripts create and seed the FartSocial SQL Server database. They are
idempotent and can be executed again to repair missing indexes or reference
data.

## Requirements

- SQL Server 2019 or later, SQL Server Express, or LocalDB
- `sqlcmd` with SQLCMD mode enabled
- Permission to create and alter the target database

## Deploy

From `database/scripts`:

```powershell
sqlcmd -S "localhost\SQLEXPRESS" -E -b -i deploy.sql
```

Deploy with a different database name:

```powershell
sqlcmd -S "YOUR_SERVER" -E -b -v DatabaseName="FartSocialProd" -i deploy.sql
```

Use SQL authentication when required:

```powershell
sqlcmd -S "YOUR_SERVER" -U "YOUR_USER" -P "YOUR_PASSWORD" -b -i deploy.sql
```

The `-b` option is required so deployment stops with a non-zero exit code when
a script fails.

## Execution Order

1. `000_create_database.sql`
2. `001_schema.sql`
3. `005_upgrade_user_data_and_audio_blob.sql`
4. `010_seed_security_and_badges.sql`
5. `020_seed_shop_catalog.sql`
6. `900_verify_deployment.sql`

`deploy.sql` runs the complete sequence.

## User Data Covered

The schema stores and protects the complete current user-data model:

- Identity, password hashes, roles, permissions, and refresh tokens
- Profile avatar and equipped cosmetics
- Owned devices, ownership history, calibrations, and logs
- Fart events, sensor measurements, rewards, visibility, and audio blobs
- Reactions, comments, friendships, and friend requests
- Wallets and append-only wallet transactions
- Earned badges and inventory acquisitions

User-owned rows are linked to `Users` by restrictive foreign keys so deleting a
user cannot silently delete or orphan their recorded data.

## Import Existing Disk Audio

The API now stores microphone recordings directly in SQL Server. To import
recordings created by the previous disk-based implementation, run the optional
script after deployment:

```powershell
sqlcmd -S "localhost\SQLEXPRESS" -E -b `
  -v LegacyAudioRoot="C:\path\to\FartSocial.Api\App_Data" `
  -i 006_import_legacy_audio_blobs.sql
```

The path must be readable by the SQL Server service account. The import updates
`BlobData`, `SizeBytes`, `Sha256`, and `UpdatedAt`. It stops with an error if
any file cannot be imported.

## Important Notes

- Super-admin accounts are intentionally not created by SQL. Configure the API
  `Seed` settings so `AuthSeeder` hashes the password correctly.
- The schema mirrors the current `FartSocialDbContext`, including relations that
  protect all user-owned data with SQL foreign keys.
- New microphone recordings are stored directly in
  `FartAudioFiles.BlobData` (`varbinary(max)`) with a SHA-256 checksum.
- Existing disk-based audio rows receive nullable blob columns during upgrade.
  Their file bytes must be imported before the old disk files are removed.
- The legacy `StorageKey` column is made nullable during upgrade so new
  blob-only uploads are accepted by an existing database.
- The API currently calls `EnsureCreatedAsync()`. Once EF migrations are added,
  replace it with a controlled migration/deployment process.
- Back up an existing database before applying scripts in production.
