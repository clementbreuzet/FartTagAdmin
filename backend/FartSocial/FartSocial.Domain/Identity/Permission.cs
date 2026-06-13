using FartSocial.Domain.Common;

namespace FartSocial.Domain.Identity;

public sealed class Permission : Entity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
