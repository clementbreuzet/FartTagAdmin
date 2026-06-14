IF OBJECT_ID(N'dbo.UserPushTokens', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserPushTokens
    (
        Id uniqueidentifier NOT NULL CONSTRAINT PK_UserPushTokens PRIMARY KEY,
        UserId uniqueidentifier NOT NULL,
        Token nvarchar(512) NOT NULL,
        Platform nvarchar(20) NOT NULL,
        DeviceName nvarchar(200) NULL,
        CreatedAt datetimeoffset NOT NULL CONSTRAINT DF_UserPushTokens_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
        UpdatedAt datetimeoffset NULL,
        LastSeenAt datetimeoffset NOT NULL,
        RevokedAt datetimeoffset NULL,
        CONSTRAINT FK_UserPushTokens_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE
    );
    CREATE UNIQUE INDEX IX_UserPushTokens_Token ON dbo.UserPushTokens(Token);
    CREATE INDEX IX_UserPushTokens_UserId ON dbo.UserPushTokens(UserId);
END;

IF OBJECT_ID(N'dbo.NotificationPreferences', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.NotificationPreferences
    (
        UserId uniqueidentifier NOT NULL CONSTRAINT PK_NotificationPreferences PRIMARY KEY,
        SocialEnabled bit NOT NULL CONSTRAINT DF_NotificationPreferences_SocialEnabled DEFAULT 1,
        RewardsEnabled bit NOT NULL CONSTRAINT DF_NotificationPreferences_RewardsEnabled DEFAULT 1,
        ChallengesEnabled bit NOT NULL CONSTRAINT DF_NotificationPreferences_ChallengesEnabled DEFAULT 1,
        DailyReminderEnabled bit NOT NULL CONSTRAINT DF_NotificationPreferences_DailyReminderEnabled DEFAULT 1,
        UpdatedAt datetimeoffset NOT NULL,
        CONSTRAINT FK_NotificationPreferences_Users_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE
    );
END;
