:setvar DatabaseName "FartSocial"

USE [$(DatabaseName)];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

-- Existing disk-based audio rows remain readable only after their bytes are
-- imported. New uploads are written directly to BlobData by the API.
IF COL_LENGTH(N'dbo.FartAudioFiles', N'BlobData') IS NULL
    ALTER TABLE dbo.FartAudioFiles ADD BlobData varbinary(max) NULL;
IF COL_LENGTH(N'dbo.FartAudioFiles', N'Sha256') IS NULL
    ALTER TABLE dbo.FartAudioFiles ADD Sha256 nvarchar(64) NULL;
IF COL_LENGTH(N'dbo.FartAudioFiles', N'StorageKey') IS NOT NULL
    ALTER TABLE dbo.FartAudioFiles ALTER COLUMN StorageKey nvarchar(250) NULL;

-- Abort before adding user integrity constraints when legacy orphan rows exist.
IF EXISTS (
    SELECT 1 FROM dbo.DeviceOwnerships item LEFT JOIN dbo.Users userItem ON userItem.Id = item.UserId WHERE userItem.Id IS NULL
    UNION ALL SELECT 1 FROM dbo.DeviceCalibrations item LEFT JOIN dbo.Users userItem ON userItem.Id = item.CalibratedByUserId WHERE userItem.Id IS NULL
    UNION ALL SELECT 1 FROM dbo.FartAudioFiles item LEFT JOIN dbo.Users userItem ON userItem.Id = item.UserId WHERE userItem.Id IS NULL
    UNION ALL SELECT 1 FROM dbo.FartEvents item LEFT JOIN dbo.Users userItem ON userItem.Id = item.UserId WHERE userItem.Id IS NULL
    UNION ALL SELECT 1 FROM dbo.Reactions item LEFT JOIN dbo.Users userItem ON userItem.Id = item.UserId WHERE userItem.Id IS NULL
    UNION ALL SELECT 1 FROM dbo.Comments item LEFT JOIN dbo.Users userItem ON userItem.Id = item.UserId WHERE userItem.Id IS NULL
    UNION ALL SELECT 1 FROM dbo.FriendRequests item LEFT JOIN dbo.Users userItem ON userItem.Id = item.RequesterUserId WHERE userItem.Id IS NULL
    UNION ALL SELECT 1 FROM dbo.FriendRequests item LEFT JOIN dbo.Users userItem ON userItem.Id = item.RecipientUserId WHERE userItem.Id IS NULL
    UNION ALL SELECT 1 FROM dbo.Friendships item LEFT JOIN dbo.Users userItem ON userItem.Id = item.UserId WHERE userItem.Id IS NULL
    UNION ALL SELECT 1 FROM dbo.Friendships item LEFT JOIN dbo.Users userItem ON userItem.Id = item.FriendUserId WHERE userItem.Id IS NULL
    UNION ALL SELECT 1 FROM dbo.Wallets item LEFT JOIN dbo.Users userItem ON userItem.Id = item.UserId WHERE userItem.Id IS NULL
    UNION ALL SELECT 1 FROM dbo.WalletTransactions item LEFT JOIN dbo.Users userItem ON userItem.Id = item.CreatedByUserId WHERE item.CreatedByUserId IS NOT NULL AND userItem.Id IS NULL
    UNION ALL SELECT 1 FROM dbo.UserBadges item LEFT JOIN dbo.Users userItem ON userItem.Id = item.UserId WHERE userItem.Id IS NULL
    UNION ALL SELECT 1 FROM dbo.UserInventoryItems item LEFT JOIN dbo.Users userItem ON userItem.Id = item.UserId WHERE userItem.Id IS NULL
)
    THROW 51100, N'Legacy orphan user data detected. Repair orphan rows before deployment.', 1;

IF EXISTS (
    SELECT 1 FROM dbo.Users userItem LEFT JOIN dbo.InventoryItems item ON item.Id = userItem.EquippedTitleInventoryItemId WHERE userItem.EquippedTitleInventoryItemId IS NOT NULL AND item.Id IS NULL
    UNION ALL SELECT 1 FROM dbo.Users userItem LEFT JOIN dbo.InventoryItems item ON item.Id = userItem.EquippedProfileFrameInventoryItemId WHERE userItem.EquippedProfileFrameInventoryItemId IS NOT NULL AND item.Id IS NULL
    UNION ALL SELECT 1 FROM dbo.Users userItem LEFT JOIN dbo.InventoryItems item ON item.Id = userItem.EquippedDetectionEffectInventoryItemId WHERE userItem.EquippedDetectionEffectInventoryItemId IS NOT NULL AND item.Id IS NULL
    UNION ALL SELECT 1 FROM dbo.UserBadges item LEFT JOIN dbo.FartEvents fartEvent ON fartEvent.Id = item.SourceFartEventId WHERE item.SourceFartEventId IS NOT NULL AND fartEvent.Id IS NULL
)
    THROW 51101, N'Legacy orphan equipped-item or badge-source data detected. Repair rows before deployment.', 1;

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_DeviceOwnerships_Users_UserId')
    ALTER TABLE dbo.DeviceOwnerships ADD CONSTRAINT FK_DeviceOwnerships_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_DeviceCalibrations_Users_CalibratedByUserId')
    ALTER TABLE dbo.DeviceCalibrations ADD CONSTRAINT FK_DeviceCalibrations_Users_CalibratedByUserId FOREIGN KEY (CalibratedByUserId) REFERENCES dbo.Users(Id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_FartAudioFiles_Users_UserId')
    ALTER TABLE dbo.FartAudioFiles ADD CONSTRAINT FK_FartAudioFiles_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_FartEvents_Users_UserId')
    ALTER TABLE dbo.FartEvents ADD CONSTRAINT FK_FartEvents_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Reactions_Users_UserId')
    ALTER TABLE dbo.Reactions ADD CONSTRAINT FK_Reactions_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Comments_Users_UserId')
    ALTER TABLE dbo.Comments ADD CONSTRAINT FK_Comments_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_FriendRequests_Users_RequesterUserId')
    ALTER TABLE dbo.FriendRequests ADD CONSTRAINT FK_FriendRequests_Users_RequesterUserId FOREIGN KEY (RequesterUserId) REFERENCES dbo.Users(Id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_FriendRequests_Users_RecipientUserId')
    ALTER TABLE dbo.FriendRequests ADD CONSTRAINT FK_FriendRequests_Users_RecipientUserId FOREIGN KEY (RecipientUserId) REFERENCES dbo.Users(Id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Friendships_Users_UserId')
    ALTER TABLE dbo.Friendships ADD CONSTRAINT FK_Friendships_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Friendships_Users_FriendUserId')
    ALTER TABLE dbo.Friendships ADD CONSTRAINT FK_Friendships_Users_FriendUserId FOREIGN KEY (FriendUserId) REFERENCES dbo.Users(Id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Wallets_Users_UserId')
    ALTER TABLE dbo.Wallets ADD CONSTRAINT FK_Wallets_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_WalletTransactions_Users_CreatedByUserId')
    ALTER TABLE dbo.WalletTransactions ADD CONSTRAINT FK_WalletTransactions_Users_CreatedByUserId FOREIGN KEY (CreatedByUserId) REFERENCES dbo.Users(Id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_UserBadges_Users_UserId')
    ALTER TABLE dbo.UserBadges ADD CONSTRAINT FK_UserBadges_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_UserBadges_FartEvents_SourceFartEventId')
    ALTER TABLE dbo.UserBadges ADD CONSTRAINT FK_UserBadges_FartEvents_SourceFartEventId FOREIGN KEY (SourceFartEventId) REFERENCES dbo.FartEvents(Id) ON DELETE SET NULL;
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_UserInventoryItems_Users_UserId')
    ALTER TABLE dbo.UserInventoryItems ADD CONSTRAINT FK_UserInventoryItems_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Users_InventoryItems_EquippedTitleInventoryItemId')
    ALTER TABLE dbo.Users ADD CONSTRAINT FK_Users_InventoryItems_EquippedTitleInventoryItemId FOREIGN KEY (EquippedTitleInventoryItemId) REFERENCES dbo.InventoryItems(Id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Users_InventoryItems_EquippedProfileFrameInventoryItemId')
    ALTER TABLE dbo.Users ADD CONSTRAINT FK_Users_InventoryItems_EquippedProfileFrameInventoryItemId FOREIGN KEY (EquippedProfileFrameInventoryItemId) REFERENCES dbo.InventoryItems(Id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Users_InventoryItems_EquippedDetectionEffectInventoryItemId')
    ALTER TABLE dbo.Users ADD CONSTRAINT FK_Users_InventoryItems_EquippedDetectionEffectInventoryItemId FOREIGN KEY (EquippedDetectionEffectInventoryItemId) REFERENCES dbo.InventoryItems(Id);

COMMIT TRANSACTION;
GO
