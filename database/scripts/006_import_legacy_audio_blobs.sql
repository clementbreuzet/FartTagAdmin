:setvar DatabaseName "FartSocial"
:setvar LegacyAudioRoot "C:\PATH\TO\FartSocial.Api\App_Data"

USE [$(DatabaseName)];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF COL_LENGTH(N'dbo.FartAudioFiles', N'StorageKey') IS NULL
BEGIN
    PRINT N'No legacy StorageKey column exists. Nothing to import.';
    RETURN;
END;

DECLARE @AudioId uniqueidentifier;
DECLARE @StorageKey nvarchar(250);
DECLARE @AbsolutePath nvarchar(4000);
DECLARE @Sql nvarchar(max);
DECLARE @Imported int = 0;
DECLARE @Failed int = 0;

DECLARE legacy_audio CURSOR LOCAL FAST_FORWARD FOR
SELECT Id, StorageKey
FROM dbo.FartAudioFiles
WHERE BlobData IS NULL AND NULLIF(StorageKey, N'') IS NOT NULL;

OPEN legacy_audio;
FETCH NEXT FROM legacy_audio INTO @AudioId, @StorageKey;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @AbsolutePath =
        N'$(LegacyAudioRoot)' +
        CASE WHEN RIGHT(N'$(LegacyAudioRoot)', 1) IN (N'\', N'/') THEN N'' ELSE N'\' END +
        REPLACE(@StorageKey, N'/', N'\');

    BEGIN TRY
        SET @Sql = N'
            UPDATE dbo.FartAudioFiles
            SET BlobData = source.BulkColumn,
                SizeBytes = DATALENGTH(source.BulkColumn),
                Sha256 = LOWER(CONVERT(varchar(64), HASHBYTES(''SHA2_256'', source.BulkColumn), 2)),
                UpdatedAt = SYSUTCDATETIME()
            FROM OPENROWSET(BULK N''' + REPLACE(@AbsolutePath, N'''', N'''''') + N''', SINGLE_BLOB) source
            WHERE Id = @Id;';

        EXEC sys.sp_executesql @Sql, N'@Id uniqueidentifier', @Id = @AudioId;
        SET @Imported += 1;
    END TRY
    BEGIN CATCH
        SET @Failed += 1;
        PRINT N'Failed to import audio ' + CONVERT(nvarchar(36), @AudioId) + N': ' + ERROR_MESSAGE();
    END CATCH;

    FETCH NEXT FROM legacy_audio INTO @AudioId, @StorageKey;
END;

CLOSE legacy_audio;
DEALLOCATE legacy_audio;

PRINT N'Legacy audio import completed. Imported=' + CONVERT(nvarchar(20), @Imported) +
      N', Failed=' + CONVERT(nvarchar(20), @Failed) + N'.';

IF @Failed > 0
    THROW 51110, N'One or more legacy audio files could not be imported.', 1;
GO
