using FartSocial.Domain.Common;

namespace FartSocial.Domain.Devices;

public sealed class Device : Entity
{
    public string SerialNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string? FirmwareVersion { get; set; }
    public string? BleMacAddress { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<DeviceOwnership> Ownerships { get; set; } = new List<DeviceOwnership>();
    public ICollection<DeviceCalibration> Calibrations { get; set; } = new List<DeviceCalibration>();
    public ICollection<DeviceLog> Logs { get; set; } = new List<DeviceLog>();
}
