# FartSocial Database Script Plan

## Current State

- SQL Server is configured through `ConnectionStrings:DefaultConnection`.
- The complete relational model is defined in `FartSocialDbContext`.
- No EF Core migrations currently exist.
- API startup calls `Database.EnsureCreatedAsync()`.
- `EnsureCreated` is suitable for disposable development databases, but it does not provide versioned upgrades for an existing database.

## Goal

Produce repeatable, reviewable SQL scripts that can:

1. Create a new FartSocial database from zero.
2. Upgrade an existing database between application versions.
3. Seed required reference data without embedding environment secrets.
4. Validate the resulting schema and indexes.
5. Roll forward safely in development, test, staging, and production.

## Recommended Approach

Use EF Core migrations as the schema source of truth, and generate idempotent SQL deployment scripts from those migrations.

Keep application/reference-data seeding separate from schema migrations:

- Schema and indexes: EF Core migrations.
- Required permissions, roles, badge catalog, loot boxes, and inventory catalog: idempotent seed SQL or a versioned seeder.
- Super-admin credentials: environment variables or secret storage, never committed SQL.
- Demo users/events: development-only seed script.

## Implementation Phases

### Phase 1: Baseline the Existing Model

1. Install or pin the EF CLI tool for the repository.
2. Add an `IDesignTimeDbContextFactory<FartSocialDbContext>` so scripts can be generated without starting the API.
3. Create an initial migration named `InitialCreate`.
4. Review every generated table, foreign key, unique constraint, precision, default, and delete behavior.
5. Generate `database/scripts/001_initial_create.sql`.
6. Test the script against an empty SQL Server database.

Suggested commands:

```powershell
dotnet tool restore
dotnet ef migrations add InitialCreate --project FartSocial.Infrastructure --startup-project FartSocial.Api
dotnet ef migrations script --idempotent --project FartSocial.Infrastructure --startup-project FartSocial.Api --output database/scripts/001_initial_create.sql
```

### Phase 2: Seed Reference Data

Create idempotent scripts using `MERGE` or guarded `INSERT` statements:

- `010_permissions_roles.sql`
- `020_badges.sql`
- `030_inventory_items.sql`
- `040_lootboxes_rewards.sql`
- `900_development_demo_data.sql`

Each reference row should use a stable code or deterministic ID. Names alone should not be used as durable identifiers.

### Phase 3: Replace `EnsureCreated`

1. Remove `Database.EnsureCreatedAsync()` from normal API startup.
2. For local development only, optionally run `Database.MigrateAsync()` behind a configuration flag.
3. In deployed environments, run generated SQL scripts before starting the new API version.
4. Fail startup with a clear health-check error when the database version is behind.

### Phase 4: Deployment Script Pipeline

For every schema change:

1. Add a named migration.
2. Generate an idempotent SQL script from the last deployed migration to the new migration.
3. Review the SQL for locks, destructive operations, and data backfills.
4. Test against both an empty database and a copy of the previous schema.
5. Apply in staging, run smoke tests, then apply in production.
6. Record the deployed migration in release notes.

Suggested layout:

```text
database/
  README.md
  scripts/
    001_initial_create.sql
    010_permissions_roles.sql
    020_badges.sql
    030_inventory_items.sql
    040_lootboxes_rewards.sql
    900_development_demo_data.sql
  verification/
    verify_schema.sql
    verify_seed_data.sql
```

## Required Schema Review

Before accepting the baseline migration, explicitly verify:

- Foreign keys from social records to `Users` are present where intended.
- Equipped inventory IDs on `Users` have appropriate foreign keys or documented soft-reference behavior.
- `FriendRequests` uniqueness allows a new request after a rejected/cancelled request.
- `Friendships` cannot store the same relationship in reverse order.
- Wallet balance remains transaction-derived and cannot drift.
- Audio files have a retention/orphan-cleanup policy.
- Microphone audio bytes are stored in `FartAudioFiles.BlobData` with SHA-256
  metadata, and legacy disk recordings are imported before disk cleanup.
- JSON reward/badge snapshots are intentional and version-tolerant.
- Indexes support feed, history, comments, profile statistics, leaderboards, and user search queries.

## Verification Checklist

- Empty-database creation succeeds.
- Applying the idempotent script twice succeeds.
- API starts without `EnsureCreated`.
- Auth register/login works.
- Device registration and event creation work.
- Feed, profiles, comments, friends, leaderboards, badges, inventory, wallet, and loot boxes return successfully.
- Seed scripts can run twice without duplicate rows.
- Backup and restore procedure is tested before production deployment.
