:setvar DatabaseName "FartSocial"

USE [$(DatabaseName)];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
    THROW 51120, N'Cannot apply user progression upgrade because dbo.Users does not exist. Run 001_schema.sql first.', 1;

IF COL_LENGTH(N'dbo.Users', N'Level') IS NULL
    ALTER TABLE dbo.Users ADD Level int NOT NULL CONSTRAINT DF_Users_Level DEFAULT 1 WITH VALUES;

IF COL_LENGTH(N'dbo.Users', N'TotalXp') IS NULL
    ALTER TABLE dbo.Users ADD TotalXp int NOT NULL CONSTRAINT DF_Users_TotalXp DEFAULT 0 WITH VALUES;

IF COL_LENGTH(N'dbo.Users', N'Gems') IS NULL
    ALTER TABLE dbo.Users ADD Gems int NOT NULL CONSTRAINT DF_Users_Gems DEFAULT 0 WITH VALUES;

COMMIT TRANSACTION;
GO
