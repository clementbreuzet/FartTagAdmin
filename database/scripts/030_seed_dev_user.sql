:setvar DatabaseName "FartSocial"

USE [$(DatabaseName)];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

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
    UPDATE dbo.Users
    SET UserName = @UserName,
        NormalizedUserName = @NormalizedUserName,
        Email = @Email,
        NormalizedEmail = @NormalizedEmail,
        PasswordHash = @PasswordHash,
        IsActive = 1,
        UpdatedAt = SYSUTCDATETIME()
    WHERE Id = @DevUserId;
END
ELSE
BEGIN
    INSERT INTO dbo.Users (
        Id,
        UserName,
        NormalizedUserName,
        Email,
        NormalizedEmail,
        PasswordHash,
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
        REPLACE(CONVERT(nvarchar(36), NEWID()), N'-', N''),
        REPLACE(CONVERT(nvarchar(36), NEWID()), N'-', N''),
        1
    );
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
