using FartSocial.Domain.Common;

namespace FartSocial.Domain.Identity;

public sealed class User : Entity
{
    public string UserName { get; set; } = string.Empty;
    public string NormalizedUserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string NormalizedEmail { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string SecurityStamp { get; set; } = Guid.NewGuid().ToString("N");
    public string ConcurrencyStamp { get; set; } = Guid.NewGuid().ToString("N");
    public bool IsActive { get; set; } = true;
    public DateTimeOffset? LastLoginAt { get; set; }
    public string? AvatarUrl { get; set; }
    public Guid? EquippedTitleInventoryItemId { get; set; }
    public Guid? EquippedProfileFrameInventoryItemId { get; set; }
    public Guid? EquippedDetectionEffectInventoryItemId { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
