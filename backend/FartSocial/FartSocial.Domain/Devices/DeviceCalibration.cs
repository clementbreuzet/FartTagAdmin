using FartSocial.Domain.Common;

namespace FartSocial.Domain.Devices;

public sealed class DeviceCalibration : Entity
{
    public Guid DeviceId { get; set; }
    public Guid CalibratedByUserId { get; set; }
    public decimal AudioOffsetDb { get; set; }
    public decimal GasOffsetKohm { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset CalibratedAt { get; set; } = DateTimeOffset.UtcNow;

    public Device? Device { get; set; }
}
