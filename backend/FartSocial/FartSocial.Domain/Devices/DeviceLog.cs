using FartSocial.Domain.Common;

namespace FartSocial.Domain.Devices;

public sealed class DeviceLog : Entity
{
    public Guid DeviceId { get; set; }
    public string Level { get; set; } = "info";
    public string Category { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Payload { get; set; }
    public DateTimeOffset LoggedAt { get; set; } = DateTimeOffset.UtcNow;

    public Device? Device { get; set; }
}
