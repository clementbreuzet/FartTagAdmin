using FartSocial.Domain.Common;

namespace FartSocial.Domain.Devices;

public sealed class DeviceOwnership : Entity
{
    public Guid DeviceId { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset AssignedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? RevokedAt { get; set; }
    public bool IsActive { get; set; } = true;

    public Device? Device { get; set; }
}
