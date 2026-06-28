:setvar DatabaseName "FartSocial"

USE [$(DatabaseName)];
GO

SET NOCOUNT ON;

DECLARE @ExpectedTables TABLE (Name sysname NOT NULL PRIMARY KEY);
INSERT INTO @ExpectedTables (Name) VALUES
(N'Users'), (N'Roles'), (N'Permissions'), (N'UserRoles'), (N'RolePermissions'),
(N'RefreshTokens'), (N'Devices'), (N'DeviceOwnerships'), (N'DeviceCalibrations'),
(N'DeviceLogs'), (N'FartAudioFiles'), (N'FartEvents'), (N'Reactions'),
(N'Wallets'), (N'WalletTransactions'),
(N'Badges'), (N'UserBadges'), (N'LootBoxes'), (N'InventoryItems'),
(N'LootBoxRewards'), (N'UserInventoryItems'), (N'UserPushTokens'),
(N'NotificationPreferences'), (N'DailyChallenges'), (N'DailyRewards');

DECLARE @MissingTables nvarchar(max);
SELECT @MissingTables = STRING_AGG(expected.Name, N', ')
FROM @ExpectedTables expected
WHERE OBJECT_ID(N'dbo.' + expected.Name, N'U') IS NULL;

IF @MissingTables IS NOT NULL
BEGIN
    DECLARE @MissingTablesMessage nvarchar(2048) = N'Missing tables: ' + @MissingTables;
    THROW 51000, @MissingTablesMessage, 1;
END;

DECLARE @ExpectedForeignKeys TABLE (Name sysname NOT NULL PRIMARY KEY);
INSERT INTO @ExpectedForeignKeys (Name) VALUES
(N'FK_UserRoles_Users_UserId'),
(N'FK_UserRoles_Roles_RoleId'),
(N'FK_RolePermissions_Roles_RoleId'),
(N'FK_RolePermissions_Permissions_PermissionId'),
(N'FK_RefreshTokens_Users_UserId'),
(N'FK_UserPushTokens_Users_UserId'),
(N'FK_NotificationPreferences_Users_UserId'),
(N'FK_DailyRewards_Users_UserId'),
(N'FK_DeviceOwnerships_Devices_DeviceId'),
(N'FK_DeviceCalibrations_Devices_DeviceId'),
(N'FK_DeviceLogs_Devices_DeviceId'),
(N'FK_FartEvents_Devices_DeviceId'),
(N'FK_FartEvents_FartAudioFiles_AudioFileId'),
(N'FK_Reactions_FartEvents_FartEventId'),
(N'FK_WalletTransactions_Wallets_WalletId'),
(N'FK_UserBadges_Badges_BadgeId'),
(N'FK_LootBoxRewards_LootBoxes_LootBoxId'),
(N'FK_LootBoxRewards_InventoryItems_InventoryItemId'),
(N'FK_UserInventoryItems_InventoryItems_InventoryItemId'),
(N'FK_UserInventoryItems_LootBoxRewards_LootBoxRewardId'),
(N'FK_DeviceOwnerships_Users_UserId'),
(N'FK_DeviceCalibrations_Users_CalibratedByUserId'),
(N'FK_FartAudioFiles_Users_UserId'),
(N'FK_FartEvents_Users_UserId'),
(N'FK_Reactions_Users_UserId'),
(N'FK_Wallets_Users_UserId'),
(N'FK_WalletTransactions_Users_CreatedByUserId'),
(N'FK_UserBadges_Users_UserId'),
(N'FK_UserBadges_FartEvents_SourceFartEventId'),
(N'FK_UserInventoryItems_Users_UserId'),
(N'FK_Users_InventoryItems_EquippedTitleInventoryItemId'),
(N'FK_Users_InventoryItems_EquippedProfileFrameInventoryItemId'),
(N'FK_Users_InventoryItems_EquippedDetectionEffectInventoryItemId');

DECLARE @MissingForeignKeys nvarchar(max);
SELECT @MissingForeignKeys = STRING_AGG(expected.Name, N', ')
FROM @ExpectedForeignKeys expected
WHERE NOT EXISTS (SELECT 1 FROM sys.foreign_keys foreignKey WHERE foreignKey.name = expected.Name);

IF @MissingForeignKeys IS NOT NULL
BEGIN
    DECLARE @MissingForeignKeysMessage nvarchar(2048) = N'Missing foreign keys: ' + @MissingForeignKeys;
    THROW 51009, @MissingForeignKeysMessage, 1;
END;

IF (SELECT COUNT(*) FROM dbo.Permissions) < 9
    THROW 51001, N'Permission seed is incomplete.', 1;
IF (SELECT COUNT(*) FROM dbo.Roles) < 5
    THROW 51002, N'Role seed is incomplete.', 1;
IF (SELECT COUNT(*) FROM dbo.Badges WHERE IsActive = 1) < 5
    THROW 51003, N'Badge seed is incomplete.', 1;
IF (SELECT COUNT(*) FROM dbo.InventoryItems) < 5
    THROW 51004, N'Inventory catalog seed is incomplete.', 1;
IF (SELECT COUNT(*) FROM dbo.LootBoxes WHERE IsActive = 1) < 5
    THROW 51005, N'Loot box seed is incomplete.', 1;
IF EXISTS (
    SELECT boxItem.Id
    FROM dbo.LootBoxes boxItem
    LEFT JOIN dbo.LootBoxRewards reward ON reward.LootBoxId = boxItem.Id AND reward.IsActive = 1
    WHERE boxItem.IsActive = 1
    GROUP BY boxItem.Id
    HAVING COUNT(reward.Id) = 0
)
    THROW 51006, N'At least one active loot box has no active reward.', 1;

IF EXISTS (
    SELECT 1
    FROM dbo.RolePermissions rolePermission
    LEFT JOIN dbo.Roles roleItem ON roleItem.Id = rolePermission.RoleId
    LEFT JOIN dbo.Permissions permissionItem ON permissionItem.Id = rolePermission.PermissionId
    WHERE roleItem.Id IS NULL OR permissionItem.Id IS NULL
)
    THROW 51007, N'Orphan role permissions detected.', 1;

IF EXISTS (
    SELECT 1
    FROM dbo.LootBoxRewards reward
    LEFT JOIN dbo.LootBoxes boxItem ON boxItem.Id = reward.LootBoxId
    LEFT JOIN dbo.InventoryItems inventoryItem ON inventoryItem.Id = reward.InventoryItemId
    WHERE boxItem.Id IS NULL OR inventoryItem.Id IS NULL
)
    THROW 51008, N'Orphan loot box rewards detected.', 1;

IF COL_LENGTH(N'dbo.FartAudioFiles', N'BlobData') IS NULL
    THROW 51010, N'FartAudioFiles.BlobData is missing.', 1;
IF COL_LENGTH(N'dbo.FartAudioFiles', N'Sha256') IS NULL
    THROW 51011, N'FartAudioFiles.Sha256 is missing.', 1;
IF EXISTS (
    SELECT 1
    FROM dbo.FartAudioFiles
    WHERE BlobData IS NOT NULL AND DATALENGTH(BlobData) <> SizeBytes
)
    THROW 51012, N'Audio blob size metadata is inconsistent.', 1;

PRINT N'FartSocial database deployment verification succeeded.';
SELECT
    DB_NAME() AS DatabaseName,
    (SELECT COUNT(*) FROM @ExpectedTables) AS ExpectedTables,
    (SELECT COUNT(*) FROM @ExpectedForeignKeys) AS ExpectedForeignKeys,
    (SELECT COUNT(*) FROM dbo.Permissions) AS Permissions,
    (SELECT COUNT(*) FROM dbo.Roles) AS Roles,
    (SELECT COUNT(*) FROM dbo.Badges) AS Badges,
    (SELECT COUNT(*) FROM dbo.InventoryItems) AS InventoryItems,
    (SELECT COUNT(*) FROM dbo.LootBoxes) AS LootBoxes,
    (SELECT COUNT(*) FROM dbo.LootBoxRewards) AS LootBoxRewards,
    (SELECT COUNT(*) FROM dbo.DailyChallenges) AS DailyChallenges,
    (SELECT COUNT(*) FROM dbo.DailyRewards) AS DailyRewards;
GO
