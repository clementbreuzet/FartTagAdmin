:setvar DatabaseName "FartSocial"

USE [$(DatabaseName)];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

BEGIN TRANSACTION;

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
CREATE TABLE dbo.Users (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_Users PRIMARY KEY,
    UserName nvarchar(50) NOT NULL,
    NormalizedUserName nvarchar(50) NOT NULL,
    Email nvarchar(254) NOT NULL,
    NormalizedEmail nvarchar(254) NOT NULL,
    PasswordHash nvarchar(max) NOT NULL,
    SecurityStamp nvarchar(64) NOT NULL,
    ConcurrencyStamp nvarchar(64) NOT NULL,
    IsActive bit NOT NULL,
    LastLoginAt datetimeoffset NULL,
    AvatarUrl nvarchar(500) NULL,
    Continent nvarchar(80) NOT NULL CONSTRAINT DF_Users_Continent DEFAULT N'Europe',
    Country nvarchar(120) NOT NULL CONSTRAINT DF_Users_Country DEFAULT N'France',
    City nvarchar(120) NOT NULL CONSTRAINT DF_Users_City DEFAULT N'Montesson',
    Level int NOT NULL CONSTRAINT DF_Users_Level DEFAULT 1,
    TotalXp int NOT NULL CONSTRAINT DF_Users_TotalXp DEFAULT 0,
    Gems int NOT NULL CONSTRAINT DF_Users_Gems DEFAULT 0,
    EquippedTitleInventoryItemId uniqueidentifier NULL,
    EquippedProfileFrameInventoryItemId uniqueidentifier NULL,
    EquippedDetectionEffectInventoryItemId uniqueidentifier NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL
);

IF OBJECT_ID(N'dbo.Roles', N'U') IS NULL
CREATE TABLE dbo.Roles (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_Roles PRIMARY KEY,
    Name nvarchar(50) NOT NULL,
    NormalizedName nvarchar(50) NOT NULL,
    Description nvarchar(250) NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_Roles_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL
);

IF OBJECT_ID(N'dbo.Permissions', N'U') IS NULL
CREATE TABLE dbo.Permissions (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_Permissions PRIMARY KEY,
    Name nvarchar(100) NOT NULL,
    Description nvarchar(250) NOT NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_Permissions_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL
);

IF OBJECT_ID(N'dbo.UserRoles', N'U') IS NULL
CREATE TABLE dbo.UserRoles (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_UserRoles PRIMARY KEY,
    UserId uniqueidentifier NOT NULL,
    RoleId uniqueidentifier NOT NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_UserRoles_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL,
    CONSTRAINT FK_UserRoles_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserRoles_Roles_RoleId FOREIGN KEY (RoleId) REFERENCES dbo.Roles(Id) ON DELETE CASCADE
);

IF OBJECT_ID(N'dbo.RolePermissions', N'U') IS NULL
CREATE TABLE dbo.RolePermissions (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_RolePermissions PRIMARY KEY,
    RoleId uniqueidentifier NOT NULL,
    PermissionId uniqueidentifier NOT NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_RolePermissions_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL,
    CONSTRAINT FK_RolePermissions_Roles_RoleId FOREIGN KEY (RoleId) REFERENCES dbo.Roles(Id) ON DELETE CASCADE,
    CONSTRAINT FK_RolePermissions_Permissions_PermissionId FOREIGN KEY (PermissionId) REFERENCES dbo.Permissions(Id) ON DELETE CASCADE
);

IF OBJECT_ID(N'dbo.RefreshTokens', N'U') IS NULL
CREATE TABLE dbo.RefreshTokens (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_RefreshTokens PRIMARY KEY,
    UserId uniqueidentifier NOT NULL,
    TokenHash nvarchar(128) NOT NULL,
    JwtId nvarchar(64) NOT NULL,
    CreatedByIp nvarchar(64) NULL,
    RevokedByIp nvarchar(64) NULL,
    ReplacedByTokenHash nvarchar(128) NULL,
    ExpiresAt datetimeoffset NOT NULL,
    RevokedAt datetimeoffset NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_RefreshTokens_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL,
    CONSTRAINT FK_RefreshTokens_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE
);

IF OBJECT_ID(N'dbo.UserPushTokens', N'U') IS NULL
CREATE TABLE dbo.UserPushTokens (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_UserPushTokens PRIMARY KEY,
    UserId uniqueidentifier NOT NULL,
    Token nvarchar(512) NOT NULL,
    Platform nvarchar(20) NOT NULL,
    DeviceName nvarchar(200) NULL,
    LastSeenAt datetimeoffset NOT NULL,
    RevokedAt datetimeoffset NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_UserPushTokens_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL,
    CONSTRAINT FK_UserPushTokens_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE
);

IF OBJECT_ID(N'dbo.NotificationPreferences', N'U') IS NULL
CREATE TABLE dbo.NotificationPreferences (
    UserId uniqueidentifier NOT NULL CONSTRAINT PK_NotificationPreferences PRIMARY KEY,
    SocialEnabled bit NOT NULL CONSTRAINT DF_NotificationPreferences_SocialEnabled DEFAULT 1,
    RewardsEnabled bit NOT NULL CONSTRAINT DF_NotificationPreferences_RewardsEnabled DEFAULT 1,
    ChallengesEnabled bit NOT NULL CONSTRAINT DF_NotificationPreferences_ChallengesEnabled DEFAULT 1,
    DailyReminderEnabled bit NOT NULL CONSTRAINT DF_NotificationPreferences_DailyReminderEnabled DEFAULT 1,
    UpdatedAt datetimeoffset NOT NULL,
    CONSTRAINT FK_NotificationPreferences_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE
);

IF OBJECT_ID(N'dbo.DailyChallenges', N'U') IS NULL
CREATE TABLE dbo.DailyChallenges (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_DailyChallenges PRIMARY KEY,
    ChallengeDate date NOT NULL,
    Title nvarchar(120) NOT NULL,
    Description nvarchar(500) NOT NULL,
    TargetCount int NOT NULL,
    RewardFlatulons int NOT NULL,
    IsActive bit NOT NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_DailyChallenges_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL
);

IF OBJECT_ID(N'dbo.DailyRewards', N'U') IS NULL
CREATE TABLE dbo.DailyRewards (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_DailyRewards PRIMARY KEY,
    UserId uniqueidentifier NOT NULL,
    RewardDate date NOT NULL,
    IsClaimed bit NOT NULL,
    ClaimedAt datetimeoffset NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_DailyRewards_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL,
    CONSTRAINT FK_DailyRewards_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE
);

IF OBJECT_ID(N'dbo.Devices', N'U') IS NULL
CREATE TABLE dbo.Devices (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_Devices PRIMARY KEY,
    SerialNumber nvarchar(80) NOT NULL,
    Name nvarchar(120) NOT NULL,
    Model nvarchar(80) NOT NULL,
    FirmwareVersion nvarchar(40) NULL,
    BleMacAddress nvarchar(32) NULL,
    IsActive bit NOT NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_Devices_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL
);

IF OBJECT_ID(N'dbo.DeviceOwnerships', N'U') IS NULL
CREATE TABLE dbo.DeviceOwnerships (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_DeviceOwnerships PRIMARY KEY,
    DeviceId uniqueidentifier NOT NULL,
    UserId uniqueidentifier NOT NULL,
    AssignedAt datetimeoffset NOT NULL,
    RevokedAt datetimeoffset NULL,
    IsActive bit NOT NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_DeviceOwnerships_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL,
    CONSTRAINT FK_DeviceOwnerships_Devices_DeviceId FOREIGN KEY (DeviceId) REFERENCES dbo.Devices(Id) ON DELETE CASCADE,
    CONSTRAINT FK_DeviceOwnerships_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
);

IF OBJECT_ID(N'dbo.DeviceCalibrations', N'U') IS NULL
CREATE TABLE dbo.DeviceCalibrations (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_DeviceCalibrations PRIMARY KEY,
    DeviceId uniqueidentifier NOT NULL,
    CalibratedByUserId uniqueidentifier NOT NULL,
    AudioOffsetDb decimal(10,2) NOT NULL,
    GasOffsetKohm decimal(10,2) NOT NULL,
    Notes nvarchar(500) NULL,
    CalibratedAt datetimeoffset NOT NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_DeviceCalibrations_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL,
    CONSTRAINT FK_DeviceCalibrations_Devices_DeviceId FOREIGN KEY (DeviceId) REFERENCES dbo.Devices(Id) ON DELETE CASCADE,
    CONSTRAINT FK_DeviceCalibrations_Users_CalibratedByUserId FOREIGN KEY (CalibratedByUserId) REFERENCES dbo.Users(Id)
);

IF OBJECT_ID(N'dbo.DeviceLogs', N'U') IS NULL
CREATE TABLE dbo.DeviceLogs (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_DeviceLogs PRIMARY KEY,
    DeviceId uniqueidentifier NOT NULL,
    Level nvarchar(20) NOT NULL,
    Category nvarchar(80) NOT NULL,
    Message nvarchar(500) NOT NULL,
    Payload nvarchar(2000) NULL,
    LoggedAt datetimeoffset NOT NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_DeviceLogs_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL,
    CONSTRAINT FK_DeviceLogs_Devices_DeviceId FOREIGN KEY (DeviceId) REFERENCES dbo.Devices(Id) ON DELETE CASCADE
);

IF OBJECT_ID(N'dbo.FartAudioFiles', N'U') IS NULL
CREATE TABLE dbo.FartAudioFiles (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_FartAudioFiles PRIMARY KEY,
    UserId uniqueidentifier NOT NULL,
    FileName nvarchar(250) NOT NULL,
    ContentType nvarchar(120) NOT NULL,
    SizeBytes bigint NOT NULL,
    DurationMs int NOT NULL,
    BlobData varbinary(max) NULL,
    Sha256 nvarchar(64) NULL,
    UploadedAt datetimeoffset NOT NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_FartAudioFiles_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL,
    CONSTRAINT FK_FartAudioFiles_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
);

IF OBJECT_ID(N'dbo.FartEvents', N'U') IS NULL
CREATE TABLE dbo.FartEvents (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_FartEvents PRIMARY KEY,
    UserId uniqueidentifier NOT NULL,
    DeviceId uniqueidentifier NOT NULL,
    AudioFileId uniqueidentifier NULL,
    OccurredAt datetimeoffset NOT NULL,
    AudioLevel int NOT NULL,
    GasLevel int NOT NULL,
    Temperature decimal(6,2) NOT NULL,
    DurationMs int NOT NULL,
    LocalScore int NOT NULL,
    OfficialScore int NOT NULL,
    AuthenticityScore int NOT NULL,
    IsAuthenticated bit NOT NULL,
    Category nvarchar(40) NOT NULL,
    Visibility int NOT NULL,
    RewardsJson nvarchar(max) NOT NULL,
    BadgesJson nvarchar(max) NOT NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_FartEvents_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL,
    CONSTRAINT FK_FartEvents_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id),
    CONSTRAINT FK_FartEvents_Devices_DeviceId FOREIGN KEY (DeviceId) REFERENCES dbo.Devices(Id),
    CONSTRAINT FK_FartEvents_FartAudioFiles_AudioFileId FOREIGN KEY (AudioFileId) REFERENCES dbo.FartAudioFiles(Id) ON DELETE SET NULL
);

IF OBJECT_ID(N'dbo.Reactions', N'U') IS NULL
CREATE TABLE dbo.Reactions (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_Reactions PRIMARY KEY,
    FartEventId uniqueidentifier NOT NULL,
    UserId uniqueidentifier NOT NULL,
    ReactionType int NOT NULL,
    ReactedAt datetimeoffset NOT NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_Reactions_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL,
    CONSTRAINT FK_Reactions_FartEvents_FartEventId FOREIGN KEY (FartEventId) REFERENCES dbo.FartEvents(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Reactions_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
);

IF OBJECT_ID(N'dbo.Wallets', N'U') IS NULL
CREATE TABLE dbo.Wallets (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_Wallets PRIMARY KEY,
    UserId uniqueidentifier NOT NULL,
    Currency nvarchar(32) NOT NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_Wallets_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL,
    CONSTRAINT FK_Wallets_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
);

IF OBJECT_ID(N'dbo.WalletTransactions', N'U') IS NULL
CREATE TABLE dbo.WalletTransactions (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_WalletTransactions PRIMARY KEY,
    WalletId uniqueidentifier NOT NULL,
    Amount decimal(18,2) NOT NULL,
    Type int NOT NULL,
    Reason nvarchar(250) NOT NULL,
    ReferenceType nvarchar(100) NULL,
    ReferenceId nvarchar(100) NULL,
    CreatedByUserId uniqueidentifier NULL,
    TransactionAt datetimeoffset NOT NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_WalletTransactions_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL,
    CONSTRAINT FK_WalletTransactions_Wallets_WalletId FOREIGN KEY (WalletId) REFERENCES dbo.Wallets(Id) ON DELETE CASCADE,
    CONSTRAINT FK_WalletTransactions_Users_CreatedByUserId FOREIGN KEY (CreatedByUserId) REFERENCES dbo.Users(Id)
);

IF OBJECT_ID(N'dbo.LootBoxes', N'U') IS NULL
CREATE TABLE dbo.LootBoxes (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_LootBoxes PRIMARY KEY,
    Name nvarchar(120) NOT NULL,
    Description nvarchar(500) NOT NULL,
    PriceFlatulons int NOT NULL,
    IsActive bit NOT NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_LootBoxes_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL
);

IF OBJECT_ID(N'dbo.InventoryItems', N'U') IS NULL
CREATE TABLE dbo.InventoryItems (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_InventoryItems PRIMARY KEY,
    Name nvarchar(120) NOT NULL,
    Category int NOT NULL,
    Rarity int NOT NULL,
    AssetKey nvarchar(250) NULL,
    Description nvarchar(500) NULL,
    IsTradable bit NOT NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_InventoryItems_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL
);

IF OBJECT_ID(N'dbo.LootBoxRewards', N'U') IS NULL
CREATE TABLE dbo.LootBoxRewards (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_LootBoxRewards PRIMARY KEY,
    LootBoxId uniqueidentifier NOT NULL,
    InventoryItemId uniqueidentifier NOT NULL,
    Rarity int NOT NULL,
    Weight decimal(18,4) NOT NULL,
    DuplicateCompensationFlatulons int NOT NULL,
    IsActive bit NOT NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_LootBoxRewards_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL,
    CONSTRAINT FK_LootBoxRewards_LootBoxes_LootBoxId FOREIGN KEY (LootBoxId) REFERENCES dbo.LootBoxes(Id) ON DELETE CASCADE,
    CONSTRAINT FK_LootBoxRewards_InventoryItems_InventoryItemId FOREIGN KEY (InventoryItemId) REFERENCES dbo.InventoryItems(Id)
);

IF OBJECT_ID(N'dbo.UserInventoryItems', N'U') IS NULL
CREATE TABLE dbo.UserInventoryItems (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_UserInventoryItems PRIMARY KEY,
    UserId uniqueidentifier NOT NULL,
    InventoryItemId uniqueidentifier NOT NULL,
    LootBoxRewardId uniqueidentifier NOT NULL,
    IsDuplicate bit NOT NULL,
    DuplicateCompensationFlatulons int NULL,
    AcquiredAt datetimeoffset NOT NULL,
    CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_UserInventoryItems_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt datetimeoffset NULL,
    CONSTRAINT FK_UserInventoryItems_InventoryItems_InventoryItemId FOREIGN KEY (InventoryItemId) REFERENCES dbo.InventoryItems(Id),
    CONSTRAINT FK_UserInventoryItems_LootBoxRewards_LootBoxRewardId FOREIGN KEY (LootBoxRewardId) REFERENCES dbo.LootBoxRewards(Id),
    CONSTRAINT FK_UserInventoryItems_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
);

COMMIT TRANSACTION;
GO

-- Indexes are created separately so the script can repair an incomplete deployment.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = N'IX_Users_NormalizedUserName')
    CREATE UNIQUE INDEX IX_Users_NormalizedUserName ON dbo.Users(NormalizedUserName);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = N'IX_Users_NormalizedEmail')
    CREATE UNIQUE INDEX IX_Users_NormalizedEmail ON dbo.Users(NormalizedEmail);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = N'IX_Users_EquippedTitleInventoryItemId')
    CREATE INDEX IX_Users_EquippedTitleInventoryItemId ON dbo.Users(EquippedTitleInventoryItemId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = N'IX_Users_EquippedProfileFrameInventoryItemId')
    CREATE INDEX IX_Users_EquippedProfileFrameInventoryItemId ON dbo.Users(EquippedProfileFrameInventoryItemId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = N'IX_Users_EquippedDetectionEffectInventoryItemId')
    CREATE INDEX IX_Users_EquippedDetectionEffectInventoryItemId ON dbo.Users(EquippedDetectionEffectInventoryItemId);
IF COL_LENGTH(N'dbo.Users', N'Continent') IS NOT NULL
   AND COL_LENGTH(N'dbo.Users', N'Country') IS NOT NULL
   AND COL_LENGTH(N'dbo.Users', N'City') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = N'IX_Users_Continent_Country_City')
    EXEC sys.sp_executesql N'CREATE INDEX IX_Users_Continent_Country_City ON dbo.Users(Continent, Country, City);';
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Roles') AND name = N'IX_Roles_NormalizedName')
    CREATE UNIQUE INDEX IX_Roles_NormalizedName ON dbo.Roles(NormalizedName);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Permissions') AND name = N'IX_Permissions_Name')
    CREATE UNIQUE INDEX IX_Permissions_Name ON dbo.Permissions(Name);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.UserRoles') AND name = N'IX_UserRoles_UserId_RoleId')
    CREATE UNIQUE INDEX IX_UserRoles_UserId_RoleId ON dbo.UserRoles(UserId, RoleId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.UserRoles') AND name = N'IX_UserRoles_RoleId')
    CREATE INDEX IX_UserRoles_RoleId ON dbo.UserRoles(RoleId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.RolePermissions') AND name = N'IX_RolePermissions_RoleId_PermissionId')
    CREATE UNIQUE INDEX IX_RolePermissions_RoleId_PermissionId ON dbo.RolePermissions(RoleId, PermissionId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.RolePermissions') AND name = N'IX_RolePermissions_PermissionId')
    CREATE INDEX IX_RolePermissions_PermissionId ON dbo.RolePermissions(PermissionId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.RefreshTokens') AND name = N'IX_RefreshTokens_TokenHash')
    CREATE UNIQUE INDEX IX_RefreshTokens_TokenHash ON dbo.RefreshTokens(TokenHash);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.RefreshTokens') AND name = N'IX_RefreshTokens_UserId')
    CREATE INDEX IX_RefreshTokens_UserId ON dbo.RefreshTokens(UserId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.UserPushTokens') AND name = N'IX_UserPushTokens_Token')
    CREATE UNIQUE INDEX IX_UserPushTokens_Token ON dbo.UserPushTokens(Token);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.UserPushTokens') AND name = N'IX_UserPushTokens_UserId')
    CREATE INDEX IX_UserPushTokens_UserId ON dbo.UserPushTokens(UserId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.DailyChallenges') AND name = N'IX_DailyChallenges_ChallengeDate')
    CREATE UNIQUE INDEX IX_DailyChallenges_ChallengeDate ON dbo.DailyChallenges(ChallengeDate);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.DailyRewards') AND name = N'IX_DailyRewards_UserId_RewardDate')
    CREATE UNIQUE INDEX IX_DailyRewards_UserId_RewardDate ON dbo.DailyRewards(UserId, RewardDate);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Devices') AND name = N'IX_Devices_SerialNumber')
    CREATE UNIQUE INDEX IX_Devices_SerialNumber ON dbo.Devices(SerialNumber);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.DeviceOwnerships') AND name = N'IX_DeviceOwnerships_DeviceId_IsActive')
    CREATE INDEX IX_DeviceOwnerships_DeviceId_IsActive ON dbo.DeviceOwnerships(DeviceId, IsActive);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.DeviceOwnerships') AND name = N'IX_DeviceOwnerships_UserId_IsActive')
    CREATE INDEX IX_DeviceOwnerships_UserId_IsActive ON dbo.DeviceOwnerships(UserId, IsActive);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.DeviceCalibrations') AND name = N'IX_DeviceCalibrations_DeviceId')
    CREATE INDEX IX_DeviceCalibrations_DeviceId ON dbo.DeviceCalibrations(DeviceId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.DeviceCalibrations') AND name = N'IX_DeviceCalibrations_CalibratedByUserId')
    CREATE INDEX IX_DeviceCalibrations_CalibratedByUserId ON dbo.DeviceCalibrations(CalibratedByUserId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.DeviceLogs') AND name = N'IX_DeviceLogs_DeviceId')
    CREATE INDEX IX_DeviceLogs_DeviceId ON dbo.DeviceLogs(DeviceId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.FartAudioFiles') AND name = N'IX_FartAudioFiles_UserId')
    CREATE INDEX IX_FartAudioFiles_UserId ON dbo.FartAudioFiles(UserId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.FartEvents') AND name = N'IX_FartEvents_AudioFileId')
    CREATE UNIQUE INDEX IX_FartEvents_AudioFileId ON dbo.FartEvents(AudioFileId) WHERE AudioFileId IS NOT NULL;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.FartEvents') AND name = N'IX_FartEvents_UserId')
    CREATE INDEX IX_FartEvents_UserId ON dbo.FartEvents(UserId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.FartEvents') AND name = N'IX_FartEvents_DeviceId')
    CREATE INDEX IX_FartEvents_DeviceId ON dbo.FartEvents(DeviceId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.FartEvents') AND name = N'IX_FartEvents_OccurredAt')
    CREATE INDEX IX_FartEvents_OccurredAt ON dbo.FartEvents(OccurredAt);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.FartEvents') AND name = N'IX_FartEvents_UserId_OccurredAt')
    CREATE INDEX IX_FartEvents_UserId_OccurredAt ON dbo.FartEvents(UserId, OccurredAt);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.FartEvents') AND name = N'IX_FartEvents_UserId_DurationMs')
    CREATE INDEX IX_FartEvents_UserId_DurationMs ON dbo.FartEvents(UserId, DurationMs);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.FartEvents') AND name = N'IX_FartEvents_UserId_GasLevel')
    CREATE INDEX IX_FartEvents_UserId_GasLevel ON dbo.FartEvents(UserId, GasLevel);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Reactions') AND name = N'IX_Reactions_FartEventId_UserId')
    CREATE UNIQUE INDEX IX_Reactions_FartEventId_UserId ON dbo.Reactions(FartEventId, UserId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Reactions') AND name = N'IX_Reactions_FartEventId')
    CREATE INDEX IX_Reactions_FartEventId ON dbo.Reactions(FartEventId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Reactions') AND name = N'IX_Reactions_UserId')
    CREATE INDEX IX_Reactions_UserId ON dbo.Reactions(UserId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Wallets') AND name = N'IX_Wallets_UserId')
    CREATE UNIQUE INDEX IX_Wallets_UserId ON dbo.Wallets(UserId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.WalletTransactions') AND name = N'IX_WalletTransactions_WalletId')
    CREATE INDEX IX_WalletTransactions_WalletId ON dbo.WalletTransactions(WalletId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.WalletTransactions') AND name = N'IX_WalletTransactions_WalletId_TransactionAt')
    CREATE INDEX IX_WalletTransactions_WalletId_TransactionAt ON dbo.WalletTransactions(WalletId, TransactionAt);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.WalletTransactions') AND name = N'IX_WalletTransactions_CreatedByUserId')
    CREATE INDEX IX_WalletTransactions_CreatedByUserId ON dbo.WalletTransactions(CreatedByUserId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.LootBoxes') AND name = N'IX_LootBoxes_Name')
    CREATE UNIQUE INDEX IX_LootBoxes_Name ON dbo.LootBoxes(Name);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.InventoryItems') AND name = N'IX_InventoryItems_Name')
    CREATE UNIQUE INDEX IX_InventoryItems_Name ON dbo.InventoryItems(Name);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.LootBoxRewards') AND name = N'IX_LootBoxRewards_LootBoxId')
    CREATE INDEX IX_LootBoxRewards_LootBoxId ON dbo.LootBoxRewards(LootBoxId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.LootBoxRewards') AND name = N'IX_LootBoxRewards_LootBoxId_InventoryItemId')
    CREATE UNIQUE INDEX IX_LootBoxRewards_LootBoxId_InventoryItemId ON dbo.LootBoxRewards(LootBoxId, InventoryItemId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.LootBoxRewards') AND name = N'IX_LootBoxRewards_InventoryItemId')
    CREATE INDEX IX_LootBoxRewards_InventoryItemId ON dbo.LootBoxRewards(InventoryItemId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.UserInventoryItems') AND name = N'IX_UserInventoryItems_UserId')
    CREATE INDEX IX_UserInventoryItems_UserId ON dbo.UserInventoryItems(UserId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.UserInventoryItems') AND name = N'IX_UserInventoryItems_InventoryItemId')
    CREATE INDEX IX_UserInventoryItems_InventoryItemId ON dbo.UserInventoryItems(InventoryItemId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.UserInventoryItems') AND name = N'IX_UserInventoryItems_LootBoxRewardId')
    CREATE INDEX IX_UserInventoryItems_LootBoxRewardId ON dbo.UserInventoryItems(LootBoxRewardId);
GO
