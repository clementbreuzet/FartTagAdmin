:setvar DatabaseName "FartSocial"

USE [$(DatabaseName)];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

DECLARE @Permissions TABLE (
    Id uniqueidentifier NOT NULL,
    Name nvarchar(100) NOT NULL,
    Description nvarchar(250) NOT NULL
);

INSERT INTO @Permissions (Id, Name, Description) VALUES
('10000000-0000-0000-0000-000000000001', N'admin.access', N'admin.access'),
('10000000-0000-0000-0000-000000000002', N'device.read', N'device.read'),
('10000000-0000-0000-0000-000000000003', N'device.calibrate', N'device.calibrate'),
('10000000-0000-0000-0000-000000000004', N'device.updateFirmware', N'device.updateFirmware'),
('10000000-0000-0000-0000-000000000005', N'device.viewLogs', N'device.viewLogs'),
('10000000-0000-0000-0000-000000000006', N'user.support', N'user.support'),
('10000000-0000-0000-0000-000000000007', N'model.manage', N'model.manage'),
('10000000-0000-0000-0000-000000000008', N'economy.manage', N'economy.manage'),
('10000000-0000-0000-0000-000000000009', N'lootbox.manage', N'lootbox.manage');

UPDATE target
SET Description = source.Description,
    UpdatedAt = SYSUTCDATETIME()
FROM dbo.Permissions target
JOIN @Permissions source ON source.Name = target.Name
WHERE target.Description <> source.Description;

INSERT INTO dbo.Permissions (Id, Name, Description)
SELECT source.Id, source.Name, source.Description
FROM @Permissions source
WHERE NOT EXISTS (SELECT 1 FROM dbo.Permissions target WHERE target.Name = source.Name);

DECLARE @Roles TABLE (
    Id uniqueidentifier NOT NULL,
    Name nvarchar(50) NOT NULL,
    NormalizedName nvarchar(50) NOT NULL,
    Description nvarchar(250) NOT NULL
);

INSERT INTO @Roles (Id, Name, NormalizedName, Description) VALUES
('20000000-0000-0000-0000-000000000001', N'User', N'USER', N'Utilisateur standard'),
('20000000-0000-0000-0000-000000000002', N'Support', N'SUPPORT', N'Support client'),
('20000000-0000-0000-0000-000000000003', N'Developer', N'DEVELOPER', N'Developpeur interne'),
('20000000-0000-0000-0000-000000000004', N'Admin', N'ADMIN', N'Administrateur'),
('20000000-0000-0000-0000-000000000005', N'SuperAdmin', N'SUPERADMIN', N'Super administrateur');

UPDATE target
SET Name = source.Name,
    Description = source.Description,
    UpdatedAt = SYSUTCDATETIME()
FROM dbo.Roles target
JOIN @Roles source ON source.NormalizedName = target.NormalizedName
WHERE target.Name <> source.Name OR ISNULL(target.Description, N'') <> source.Description;

INSERT INTO dbo.Roles (Id, Name, NormalizedName, Description)
SELECT source.Id, source.Name, source.NormalizedName, source.Description
FROM @Roles source
WHERE NOT EXISTS (SELECT 1 FROM dbo.Roles target WHERE target.NormalizedName = source.NormalizedName);

DECLARE @RoleGrants TABLE (
    RoleName nvarchar(50) NOT NULL,
    PermissionName nvarchar(100) NOT NULL
);

INSERT INTO @RoleGrants (RoleName, PermissionName) VALUES
(N'SUPPORT', N'user.support'),
(N'SUPPORT', N'device.read'),
(N'DEVELOPER', N'device.read'),
(N'DEVELOPER', N'device.calibrate'),
(N'DEVELOPER', N'device.updateFirmware'),
(N'DEVELOPER', N'device.viewLogs'),
(N'DEVELOPER', N'model.manage'),
(N'ADMIN', N'admin.access'),
(N'ADMIN', N'device.read'),
(N'ADMIN', N'device.calibrate'),
(N'ADMIN', N'device.updateFirmware'),
(N'ADMIN', N'device.viewLogs'),
(N'ADMIN', N'user.support'),
(N'ADMIN', N'model.manage'),
(N'ADMIN', N'economy.manage'),
(N'ADMIN', N'lootbox.manage'),
(N'SUPERADMIN', N'admin.access'),
(N'SUPERADMIN', N'device.read'),
(N'SUPERADMIN', N'device.calibrate'),
(N'SUPERADMIN', N'device.updateFirmware'),
(N'SUPERADMIN', N'device.viewLogs'),
(N'SUPERADMIN', N'user.support'),
(N'SUPERADMIN', N'model.manage'),
(N'SUPERADMIN', N'economy.manage'),
(N'SUPERADMIN', N'lootbox.manage');

INSERT INTO dbo.RolePermissions (Id, RoleId, PermissionId)
SELECT NEWID(), roleItem.Id, permissionItem.Id
FROM @RoleGrants grantItem
JOIN dbo.Roles roleItem ON roleItem.NormalizedName = grantItem.RoleName
JOIN dbo.Permissions permissionItem ON permissionItem.Name = grantItem.PermissionName
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.RolePermissions existing
    WHERE existing.RoleId = roleItem.Id AND existing.PermissionId = permissionItem.Id
);

COMMIT TRANSACTION;
GO
