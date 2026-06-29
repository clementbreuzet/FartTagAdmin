:setvar DatabaseName "FartSocial"

USE [$(DatabaseName)];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
    THROW 51120, N'Cannot apply user progression upgrade because dbo.Users does not exist. Run 001_schema.sql first.', 1;

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
