:setvar DatabaseName "FartSocial"

USE [$(DatabaseName)];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
    THROW 51102, N'Cannot seed dev user because dbo.Users does not exist. Run 001_schema.sql first.', 1;

IF COL_LENGTH(N'dbo.Users', N'Level') IS NULL
    ALTER TABLE dbo.Users ADD Level int NOT NULL CONSTRAINT DF_Users_Level DEFAULT 1 WITH VALUES;

IF COL_LENGTH(N'dbo.Users', N'TotalXp') IS NULL
    ALTER TABLE dbo.Users ADD TotalXp int NOT NULL CONSTRAINT DF_Users_TotalXp DEFAULT 0 WITH VALUES;

IF COL_LENGTH(N'dbo.Users', N'Gems') IS NULL
    ALTER TABLE dbo.Users ADD Gems int NOT NULL CONSTRAINT DF_Users_Gems DEFAULT 0 WITH VALUES;

IF COL_LENGTH(N'dbo.Users', N'Continent') IS NULL
    ALTER TABLE dbo.Users ADD Continent nvarchar(80) NOT NULL CONSTRAINT DF_Users_Continent DEFAULT N'Europe' WITH VALUES;

IF COL_LENGTH(N'dbo.Users', N'Country') IS NULL
    ALTER TABLE dbo.Users ADD Country nvarchar(120) NOT NULL CONSTRAINT DF_Users_Country DEFAULT N'France' WITH VALUES;

IF COL_LENGTH(N'dbo.Users', N'City') IS NULL
    ALTER TABLE dbo.Users ADD City nvarchar(120) NOT NULL CONSTRAINT DF_Users_City DEFAULT N'Montesson' WITH VALUES;

GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = N'IX_Users_Continent_Country_City')
    EXEC sys.sp_executesql N'CREATE INDEX IX_Users_Continent_Country_City ON dbo.Users(Continent, Country, City);';
GO

BEGIN TRANSACTION;

DECLARE @UserRoleId uniqueidentifier;
SELECT @UserRoleId = Id
FROM dbo.Roles
WHERE NormalizedName = N'USER';

IF @UserRoleId IS NULL
    THROW 51100, N'Cannot seed dev user because the User role does not exist. Run 010_seed_security_and_badges.sql first.', 1;

DECLARE @DevUserId uniqueidentifier = '40000000-0000-0000-0000-000000000001';
DECLARE @UserName nvarchar(50) = N'usb-tester';
DECLARE @NormalizedUserName nvarchar(50) = N'USB-TESTER';
DECLARE @Email nvarchar(254) = N'usb-tester@farttag.local';
DECLARE @NormalizedEmail nvarchar(254) = N'USB-TESTER@FARTTAG.LOCAL';
DECLARE @PasswordHash nvarchar(max) = N'AQAAAAIAAYagAAAAEIGhj03fUbF7fPZtF4bI0e3t+P8Y9ibD2rsvjuX2pVxCo9SE94DRL4QAXgZFtjVqqQ==';

DECLARE @ExistingByUserName uniqueidentifier;
DECLARE @ExistingByEmail uniqueidentifier;

SELECT @ExistingByUserName = Id
FROM dbo.Users
WHERE NormalizedUserName = @NormalizedUserName;

SELECT @ExistingByEmail = Id
FROM dbo.Users
WHERE NormalizedEmail = @NormalizedEmail;

IF @ExistingByUserName IS NOT NULL
   AND @ExistingByEmail IS NOT NULL
   AND @ExistingByUserName <> @ExistingByEmail
    THROW 51101, N'Cannot seed dev user because username and email belong to different users.', 1;

SET @DevUserId = COALESCE(@ExistingByUserName, @ExistingByEmail, @DevUserId);

IF EXISTS (SELECT 1 FROM dbo.Users WHERE Id = @DevUserId)
BEGIN
    EXEC sys.sp_executesql
        N'UPDATE dbo.Users
          SET UserName = @UserName,
              NormalizedUserName = @NormalizedUserName,
              Email = @Email,
              NormalizedEmail = @NormalizedEmail,
              PasswordHash = @PasswordHash,
              Continent = N''Europe'',
              Country = N''France'',
              City = N''Montesson'',
              IsActive = 1,
              UpdatedAt = SYSUTCDATETIME()
          WHERE Id = @DevUserId;',
        N'@DevUserId uniqueidentifier,
          @UserName nvarchar(50),
          @NormalizedUserName nvarchar(50),
          @Email nvarchar(254),
          @NormalizedEmail nvarchar(254),
          @PasswordHash nvarchar(max)',
        @DevUserId,
        @UserName,
        @NormalizedUserName,
        @Email,
        @NormalizedEmail,
        @PasswordHash;
END
ELSE
BEGIN
    EXEC sys.sp_executesql
        N'INSERT INTO dbo.Users (
              Id,
              UserName,
              NormalizedUserName,
              Email,
              NormalizedEmail,
              PasswordHash,
              Continent,
              Country,
              City,
              SecurityStamp,
              ConcurrencyStamp,
              IsActive
          )
          VALUES (
              @DevUserId,
              @UserName,
              @NormalizedUserName,
              @Email,
              @NormalizedEmail,
              @PasswordHash,
              N''Europe'',
              N''France'',
              N''Montesson'',
              REPLACE(CONVERT(nvarchar(36), NEWID()), N''-'', N''''),
              REPLACE(CONVERT(nvarchar(36), NEWID()), N''-'', N''''),
              1
          );',
        N'@DevUserId uniqueidentifier,
          @UserName nvarchar(50),
          @NormalizedUserName nvarchar(50),
          @Email nvarchar(254),
          @NormalizedEmail nvarchar(254),
          @PasswordHash nvarchar(max)',
        @DevUserId,
        @UserName,
        @NormalizedUserName,
        @Email,
        @NormalizedEmail,
        @PasswordHash;
END;

IF NOT EXISTS (
    SELECT 1
    FROM dbo.UserRoles
    WHERE UserId = @DevUserId AND RoleId = @UserRoleId
)
BEGIN
    INSERT INTO dbo.UserRoles (Id, UserId, RoleId)
    VALUES (NEWID(), @DevUserId, @UserRoleId);
END;

COMMIT TRANSACTION;

PRINT N'Dev user seeded: usb-tester / UsbTest!2026';
GO
