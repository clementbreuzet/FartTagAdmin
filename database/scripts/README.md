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
4. `007_upgrade_user_progression.sql`
5. `010_seed_security_and_badges.sql` (security only for V0)
6. `020_seed_shop_catalog.sql`
7. `900_verify_deployment.sql`

`deploy.sql` runs the complete sequence.

## Optional Dev User

For local mobile development, seed the known dev account after the security seed
has created roles:

```powershell
sqlcmd -S "localhost\SQLEXPRESS" -E -b -i 030_seed_dev_user.sql
```

The script creates or repairs `usb-tester@farttag.local` with username
`usb-tester` and password `UsbTest!2026`, then assigns the `User` role.
Do not run it in production.

## User Progression Upgrade

The backend startup runner applies this script automatically in order. For
manual repair only, it can also be run directly:

```powershell
sqlcmd -S "localhost\SQLEXPRESS" -E -b -i 007_upgrade_user_progression.sql
```

The script only checks `dbo.Users` and adds `Level`, `TotalXp`, and `Gems`
when they are missing.

## User Data Covered

The V0 schema stores and protects the minimal current user-data model:

- Identity, password hashes, roles, permissions, and refresh tokens
- Profile avatar and equipped cosmetics
- Owned devices, ownership history, calibrations, and logs
- Fart events, sensor measurements, rewards, visibility, and audio blobs
- Public feed reactions
- Wallets and append-only wallet transactions
- Loot boxes and minimal inventory acquisitions
- Daily challenges, daily rewards, notification preferences, and push tokens

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
- The schema is intentionally reduced for V0. Legacy controllers may remain in
  code for compatibility, but comments, friends, and badges are not deployed.
- New microphone recordings are stored directly in
  `FartAudioFiles.BlobData` (`varbinary(max)`) with a SHA-256 checksum.
- Existing disk-based audio rows receive nullable blob columns during upgrade.
  Their file bytes must be imported before the old disk files are removed.
- The legacy `StorageKey` column is made nullable during upgrade so new
  blob-only uploads are accepted by an existing database.
- The API applies the ordered idempotent startup scripts before seeding auth
  data. Once EF migrations are added, replace this bootstrap runner with a
  controlled migration/deployment process.
- Back up an existing database before applying scripts in production.
