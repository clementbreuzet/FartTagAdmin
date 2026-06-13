using FartSocial.Domain.Common;

namespace FartSocial.Domain.Identity;

public sealed class RolePermission : Entity
{
    public Guid RoleId { get; set; }
    public Guid PermissionId { get; set; }

    public Role? Role { get; set; }
    public Permission? Permission { get; set; }
}
