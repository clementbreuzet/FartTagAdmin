:setvar DatabaseName "FartSocial"

SET NOCOUNT ON;

IF DB_ID(N'$(DatabaseName)') IS NULL
BEGIN
    PRINT N'Creating database [$(DatabaseName)]...';
    DECLARE @CreateDatabaseSql nvarchar(max) =
        N'CREATE DATABASE [' + REPLACE(N'$(DatabaseName)', N']', N']]') + N']';
    EXEC sys.sp_executesql @CreateDatabaseSql;
END
ELSE
BEGIN
    PRINT N'Database [$(DatabaseName)] already exists.';
END;
GO

ALTER DATABASE [$(DatabaseName)] SET READ_COMMITTED_SNAPSHOT ON WITH ROLLBACK IMMEDIATE;
ALTER DATABASE [$(DatabaseName)] SET ALLOW_SNAPSHOT_ISOLATION ON;
GO
