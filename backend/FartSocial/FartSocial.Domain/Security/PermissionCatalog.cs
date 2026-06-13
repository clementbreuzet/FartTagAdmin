namespace FartSocial.Domain.Security;

public static class PermissionCatalog
{
    public const string AdminAccess = "admin.access";
    public const string DeviceRead = "device.read";
    public const string DeviceCalibrate = "device.calibrate";
    public const string DeviceUpdateFirmware = "device.updateFirmware";
    public const string DeviceViewLogs = "device.viewLogs";
    public const string UserSupport = "user.support";
    public const string ModelManage = "model.manage";
    public const string EconomyManage = "economy.manage";
    public const string LootboxManage = "lootbox.manage";

    public static readonly string[] All =
    [
        AdminAccess,
        DeviceRead,
        DeviceCalibrate,
        DeviceUpdateFirmware,
        DeviceViewLogs,
        UserSupport,
        ModelManage,
        EconomyManage,
        LootboxManage,
    ];
}
