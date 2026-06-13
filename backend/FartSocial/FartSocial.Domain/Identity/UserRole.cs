using FartSocial.Domain.Common;

namespace FartSocial.Domain.Identity;

public sealed class UserRole : Entity
{
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }

    public User? User { get; set; }
    public Role? Role { get; set; }
}
