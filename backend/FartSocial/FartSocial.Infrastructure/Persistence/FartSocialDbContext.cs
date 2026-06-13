using FartSocial.Domain.Identity;
using FartSocial.Domain.Devices;
using FartSocial.Domain.FartEvents;
using FartSocial.Domain.Economy;
using FartSocial.Domain.Badges;
using FartSocial.Domain.LootBoxes;
using FartSocial.Domain.Social;
using FartSocial.Domain.Security;
using Microsoft.EntityFrameworkCore;

namespace FartSocial.Infrastructure.Persistence;

public sealed class FartSocialDbContext(DbContextOptions<FartSocialDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<DeviceOwnership> DeviceOwnerships => Set<DeviceOwnership>();
    public DbSet<DeviceCalibration> DeviceCalibrations => Set<DeviceCalibration>();
    public DbSet<DeviceLog> DeviceLogs => Set<DeviceLog>();
    public DbSet<FartEvent> FartEvents => Set<FartEvent>();
    public DbSet<FartAudioFile> FartAudioFiles => Set<FartAudioFile>();
    public DbSet<Wallet> Wallets => Set<Wallet>();
    public DbSet<WalletTransaction> WalletTransactions => Set<WalletTransaction>();
    public DbSet<Badge> Badges => Set<Badge>();
    public DbSet<UserBadge> UserBadges => Set<UserBadge>();
    public DbSet<LootBox> LootBoxes => Set<LootBox>();
    public DbSet<LootBoxReward> LootBoxRewards => Set<LootBoxReward>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<UserInventoryItem> UserInventoryItems => Set<UserInventoryItem>();
    public DbSet<Friendship> Friendships => Set<Friendship>();
    public DbSet<FriendRequest> FriendRequests => Set<FriendRequest>();
    public DbSet<Reaction> Reactions => Set<Reaction>();
    public DbSet<Comment> Comments => Set<Comment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(builder =>
        {
            builder.ToTable("Users");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.UserName).HasMaxLength(50).IsRequired();
            builder.Property(x => x.NormalizedUserName).HasMaxLength(50).IsRequired();
            builder.Property(x => x.Email).HasMaxLength(254).IsRequired();
            builder.Property(x => x.NormalizedEmail).HasMaxLength(254).IsRequired();
            builder.Property(x => x.PasswordHash).IsRequired();
            builder.Property(x => x.SecurityStamp).HasMaxLength(64).IsRequired();
            builder.Property(x => x.ConcurrencyStamp).HasMaxLength(64).IsRequired();
            builder.Property(x => x.AvatarUrl).HasMaxLength(500);
            builder.Property(x => x.EquippedTitleInventoryItemId);
            builder.Property(x => x.EquippedProfileFrameInventoryItemId);
            builder.Property(x => x.EquippedDetectionEffectInventoryItemId);
            builder.HasIndex(x => x.NormalizedUserName).IsUnique();
            builder.HasIndex(x => x.NormalizedEmail).IsUnique();
        });

        modelBuilder.Entity<Role>(builder =>
        {
            builder.ToTable("Roles");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).HasMaxLength(50).IsRequired();
            builder.Property(x => x.NormalizedName).HasMaxLength(50).IsRequired();
            builder.Property(x => x.Description).HasMaxLength(250);
            builder.HasIndex(x => x.NormalizedName).IsUnique();
        });

        modelBuilder.Entity<Permission>(builder =>
        {
            builder.ToTable("Permissions");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).HasMaxLength(100).IsRequired();
            builder.Property(x => x.Description).HasMaxLength(250).IsRequired();
            builder.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<UserRole>(builder =>
        {
            builder.ToTable("UserRoles");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.UserId).IsRequired();
            builder.Property(x => x.RoleId).IsRequired();
            builder.HasIndex(x => new { x.UserId, x.RoleId }).IsUnique();
            builder.HasOne(x => x.User).WithMany(x => x.UserRoles).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(x => x.Role).WithMany(x => x.UserRoles).HasForeignKey(x => x.RoleId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RolePermission>(builder =>
        {
            builder.ToTable("RolePermissions");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.RoleId).IsRequired();
            builder.Property(x => x.PermissionId).IsRequired();
            builder.HasIndex(x => new { x.RoleId, x.PermissionId }).IsUnique();
            builder.HasOne(x => x.Role).WithMany(x => x.RolePermissions).HasForeignKey(x => x.RoleId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(x => x.Permission).WithMany(x => x.RolePermissions).HasForeignKey(x => x.PermissionId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RefreshToken>(builder =>
        {
            builder.ToTable("RefreshTokens");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.UserId).IsRequired();
            builder.Property(x => x.TokenHash).HasMaxLength(128).IsRequired();
            builder.Property(x => x.JwtId).HasMaxLength(64).IsRequired();
            builder.Property(x => x.CreatedByIp).HasMaxLength(64);
            builder.Property(x => x.RevokedByIp).HasMaxLength(64);
            builder.Property(x => x.ReplacedByTokenHash).HasMaxLength(128);
            builder.HasIndex(x => x.TokenHash).IsUnique();
            builder.HasIndex(x => x.UserId);
            builder.HasOne<User>().WithMany(x => x.RefreshTokens).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Device>(builder =>
        {
            builder.ToTable("Devices");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.SerialNumber).HasMaxLength(80).IsRequired();
            builder.Property(x => x.Name).HasMaxLength(120).IsRequired();
            builder.Property(x => x.Model).HasMaxLength(80).IsRequired();
            builder.Property(x => x.FirmwareVersion).HasMaxLength(40);
            builder.Property(x => x.BleMacAddress).HasMaxLength(32);
            builder.HasIndex(x => x.SerialNumber).IsUnique();
        });

        modelBuilder.Entity<DeviceOwnership>(builder =>
        {
            builder.ToTable("DeviceOwnerships");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.DeviceId).IsRequired();
            builder.Property(x => x.UserId).IsRequired();
            builder.Property(x => x.IsActive).IsRequired();
            builder.Property(x => x.AssignedAt).IsRequired();
            builder.Property(x => x.RevokedAt);
            builder.HasIndex(x => new { x.DeviceId, x.IsActive });
            builder.HasIndex(x => new { x.UserId, x.IsActive });
            builder.HasOne(x => x.Device).WithMany(x => x.Ownerships).HasForeignKey(x => x.DeviceId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DeviceCalibration>(builder =>
        {
            builder.ToTable("DeviceCalibrations");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.DeviceId).IsRequired();
            builder.Property(x => x.CalibratedByUserId).IsRequired();
            builder.Property(x => x.AudioOffsetDb).HasPrecision(10, 2);
            builder.Property(x => x.GasOffsetKohm).HasPrecision(10, 2);
            builder.Property(x => x.Notes).HasMaxLength(500);
            builder.Property(x => x.CalibratedAt).IsRequired();
            builder.HasIndex(x => x.DeviceId);
            builder.HasOne(x => x.Device).WithMany(x => x.Calibrations).HasForeignKey(x => x.DeviceId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DeviceLog>(builder =>
        {
            builder.ToTable("DeviceLogs");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.DeviceId).IsRequired();
            builder.Property(x => x.Level).HasMaxLength(20).IsRequired();
            builder.Property(x => x.Category).HasMaxLength(80).IsRequired();
            builder.Property(x => x.Message).HasMaxLength(500).IsRequired();
            builder.Property(x => x.Payload).HasMaxLength(2000);
            builder.Property(x => x.LoggedAt).IsRequired();
            builder.HasIndex(x => x.DeviceId);
            builder.HasOne(x => x.Device).WithMany(x => x.Logs).HasForeignKey(x => x.DeviceId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FartAudioFile>(builder =>
        {
            builder.ToTable("FartAudioFiles");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.UserId).IsRequired();
            builder.Property(x => x.StorageKey).HasMaxLength(250).IsRequired();
            builder.Property(x => x.FileName).HasMaxLength(250).IsRequired();
            builder.Property(x => x.ContentType).HasMaxLength(120).IsRequired();
            builder.Property(x => x.SizeBytes).IsRequired();
            builder.Property(x => x.DurationMs).IsRequired();
            builder.Property(x => x.PublicUrl).HasMaxLength(500);
            builder.Property(x => x.UploadedAt).IsRequired();
            builder.HasIndex(x => x.UserId);
        });

        modelBuilder.Entity<FartEvent>(builder =>
        {
            builder.ToTable("FartEvents");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.UserId).IsRequired();
            builder.Property(x => x.DeviceId).IsRequired();
            builder.Property(x => x.AudioFileId);
            builder.Property(x => x.OccurredAt).IsRequired();
            builder.Property(x => x.AudioLevel).IsRequired();
            builder.Property(x => x.GasLevel).IsRequired();
            builder.Property(x => x.Temperature).HasPrecision(6, 2).IsRequired();
            builder.Property(x => x.DurationMs).IsRequired();
            builder.Property(x => x.LocalScore).IsRequired();
            builder.Property(x => x.OfficialScore).IsRequired();
            builder.Property(x => x.AuthenticityScore).IsRequired();
            builder.Property(x => x.IsAuthenticated).IsRequired();
            builder.Property(x => x.Category).HasMaxLength(40).IsRequired();
            builder.Property(x => x.Visibility).HasConversion<int>().IsRequired();
            builder.Property(x => x.RewardsJson).HasColumnType("nvarchar(max)").IsRequired();
            builder.Property(x => x.BadgesJson).HasColumnType("nvarchar(max)").IsRequired();
            builder.HasIndex(x => x.UserId);
            builder.HasIndex(x => x.DeviceId);
            builder.HasIndex(x => x.OccurredAt);
            builder.HasIndex(x => new { x.UserId, x.OccurredAt });
            builder.HasIndex(x => new { x.UserId, x.DurationMs });
            builder.HasIndex(x => new { x.UserId, x.GasLevel });
            builder.HasOne(x => x.Device).WithMany().HasForeignKey(x => x.DeviceId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.AudioFile).WithOne(x => x.FartEvent).HasForeignKey<FartEvent>(x => x.AudioFileId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Reaction>(builder =>
        {
            builder.ToTable("Reactions");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.FartEventId).IsRequired();
            builder.Property(x => x.UserId).IsRequired();
            builder.Property(x => x.ReactionType).HasConversion<int>().IsRequired();
            builder.Property(x => x.ReactedAt).IsRequired();
            builder.HasIndex(x => new { x.FartEventId, x.UserId }).IsUnique();
            builder.HasIndex(x => x.FartEventId);
            builder.HasOne(x => x.FartEvent).WithMany(x => x.Reactions).HasForeignKey(x => x.FartEventId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Comment>(builder =>
        {
            builder.ToTable("Comments");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.FartEventId).IsRequired();
            builder.Property(x => x.UserId).IsRequired();
            builder.Property(x => x.Content).HasMaxLength(1000).IsRequired();
            builder.Property(x => x.CommentedAt).IsRequired();
            builder.HasIndex(x => x.FartEventId);
            builder.HasIndex(x => new { x.FartEventId, x.CommentedAt });
            builder.HasIndex(x => x.UserId);
            builder.HasOne<FartEvent>().WithMany().HasForeignKey(x => x.FartEventId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FriendRequest>(builder =>
        {
            builder.ToTable("FriendRequests");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.RequesterUserId).IsRequired();
            builder.Property(x => x.RecipientUserId).IsRequired();
            builder.Property(x => x.Status).HasConversion<int>().IsRequired();
            builder.Property(x => x.RequestedAt).IsRequired();
            builder.Property(x => x.RespondedAt);
            builder.HasIndex(x => new { x.RequesterUserId, x.RecipientUserId }).IsUnique();
            builder.HasIndex(x => x.RequesterUserId);
            builder.HasIndex(x => x.RecipientUserId);
            builder.HasIndex(x => new { x.RecipientUserId, x.Status });
            builder.HasIndex(x => new { x.RequesterUserId, x.Status });
        });

        modelBuilder.Entity<Wallet>(builder =>
        {
            builder.ToTable("Wallets");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.UserId).IsRequired();
            builder.Property(x => x.Currency).HasMaxLength(32).IsRequired();
            builder.HasIndex(x => x.UserId).IsUnique();
        });

        modelBuilder.Entity<WalletTransaction>(builder =>
        {
            builder.ToTable("WalletTransactions");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.WalletId).IsRequired();
            builder.Property(x => x.Amount).HasPrecision(18, 2).IsRequired();
            builder.Property(x => x.Type).HasConversion<int>().IsRequired();
            builder.Property(x => x.Reason).HasMaxLength(250).IsRequired();
            builder.Property(x => x.ReferenceType).HasMaxLength(100);
            builder.Property(x => x.ReferenceId).HasMaxLength(100);
            builder.Property(x => x.CreatedByUserId);
            builder.Property(x => x.TransactionAt).IsRequired();
            builder.HasIndex(x => x.WalletId);
            builder.HasIndex(x => new { x.WalletId, x.TransactionAt });
            builder.HasOne(x => x.Wallet).WithMany(x => x.Transactions).HasForeignKey(x => x.WalletId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Badge>(builder =>
        {
            builder.ToTable("Badges");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Code).HasMaxLength(80).IsRequired();
            builder.Property(x => x.Name).HasMaxLength(120).IsRequired();
            builder.Property(x => x.Description).HasMaxLength(500).IsRequired();
            builder.Property(x => x.Rarity).HasConversion<int>().IsRequired();
            builder.Property(x => x.IconKey).HasMaxLength(250);
            builder.Property(x => x.IsActive).IsRequired();
            builder.HasIndex(x => x.Code).IsUnique();
        });

        modelBuilder.Entity<UserBadge>(builder =>
        {
            builder.ToTable("UserBadges");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.UserId).IsRequired();
            builder.Property(x => x.BadgeId).IsRequired();
            builder.Property(x => x.SourceFartEventId);
            builder.Property(x => x.EarnedAt).IsRequired();
            builder.HasIndex(x => new { x.UserId, x.BadgeId }).IsUnique();
            builder.HasIndex(x => x.UserId);
            builder.HasOne(x => x.Badge).WithMany(x => x.UserBadges).HasForeignKey(x => x.BadgeId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LootBox>(builder =>
        {
            builder.ToTable("LootBoxes");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).HasMaxLength(120).IsRequired();
            builder.Property(x => x.Description).HasMaxLength(500).IsRequired();
            builder.Property(x => x.PriceFlatulons).IsRequired();
            builder.Property(x => x.IsActive).IsRequired();
            builder.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<InventoryItem>(builder =>
        {
            builder.ToTable("InventoryItems");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Name).HasMaxLength(120).IsRequired();
            builder.Property(x => x.Category).HasConversion<int>().IsRequired();
            builder.Property(x => x.Rarity).HasConversion<int>().IsRequired();
            builder.Property(x => x.AssetKey).HasMaxLength(250);
            builder.Property(x => x.Description).HasMaxLength(500);
            builder.Property(x => x.IsTradable).IsRequired();
            builder.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<LootBoxReward>(builder =>
        {
            builder.ToTable("LootBoxRewards");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.LootBoxId).IsRequired();
            builder.Property(x => x.InventoryItemId).IsRequired();
            builder.Property(x => x.Rarity).HasConversion<int>().IsRequired();
            builder.Property(x => x.Weight).HasPrecision(18, 4).IsRequired();
            builder.Property(x => x.DuplicateCompensationFlatulons).IsRequired();
            builder.Property(x => x.IsActive).IsRequired();
            builder.HasIndex(x => x.LootBoxId);
            builder.HasIndex(x => new { x.LootBoxId, x.InventoryItemId }).IsUnique();
            builder.HasOne(x => x.LootBox).WithMany(x => x.Rewards).HasForeignKey(x => x.LootBoxId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(x => x.InventoryItem).WithMany().HasForeignKey(x => x.InventoryItemId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<UserInventoryItem>(builder =>
        {
            builder.ToTable("UserInventoryItems");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.UserId).IsRequired();
            builder.Property(x => x.InventoryItemId).IsRequired();
            builder.Property(x => x.LootBoxRewardId).IsRequired();
            builder.Property(x => x.IsDuplicate).IsRequired();
            builder.Property(x => x.DuplicateCompensationFlatulons);
            builder.Property(x => x.AcquiredAt).IsRequired();
            builder.HasIndex(x => x.UserId);
            builder.HasIndex(x => x.InventoryItemId);
            builder.HasIndex(x => x.LootBoxRewardId);
            builder.HasOne(x => x.InventoryItem).WithMany(x => x.UserItems).HasForeignKey(x => x.InventoryItemId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.LootBoxReward).WithMany().HasForeignKey(x => x.LootBoxRewardId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Friendship>(builder =>
        {
            builder.ToTable("Friendships");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.UserId).IsRequired();
            builder.Property(x => x.FriendUserId).IsRequired();
            builder.Property(x => x.AcceptedAt).IsRequired();
            builder.HasIndex(x => new { x.UserId, x.FriendUserId }).IsUnique();
            builder.HasIndex(x => x.UserId);
            builder.HasIndex(x => x.FriendUserId);
        });

        modelBuilder.Entity<User>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<Role>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<Permission>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<UserRole>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<RolePermission>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<RefreshToken>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<Device>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<DeviceOwnership>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<DeviceCalibration>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<DeviceLog>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<FartAudioFile>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<FartEvent>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<Reaction>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<Comment>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<Wallet>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<WalletTransaction>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<Badge>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<UserBadge>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<LootBox>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<LootBoxReward>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<InventoryItem>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<UserInventoryItem>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<Friendship>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        modelBuilder.Entity<FriendRequest>().Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
    }
}
