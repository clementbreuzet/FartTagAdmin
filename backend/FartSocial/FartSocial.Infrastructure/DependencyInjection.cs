using FartSocial.Application.Auth;
using FartSocial.Application.Badges;
using FartSocial.Application.Economy;
using FartSocial.Application.Devices;
using FartSocial.Application.Inventory;
using FartSocial.Application.Leaderboards;
using FartSocial.Application.FartEvents;
using FartSocial.Application.Social;
using FartSocial.Application.LootBoxes;
using FartSocial.Domain.Identity;
using FartSocial.Infrastructure.Auth;
using FartSocial.Infrastructure.Badges;
using FartSocial.Infrastructure.Configuration;
using FartSocial.Infrastructure.Economy;
using FartSocial.Infrastructure.Devices;
using FartSocial.Infrastructure.Inventory;
using FartSocial.Infrastructure.FartEvents;
using FartSocial.Infrastructure.LootBoxes;
using FartSocial.Infrastructure.Leaderboards;
using FartSocial.Infrastructure.Social;
using FartSocial.Infrastructure.Persistence;
using FartSocial.Infrastructure.Seeding;
using FartSocial.Infrastructure.Security;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FartSocial.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<SeedOptions>(configuration.GetSection(SeedOptions.SectionName));

        services.AddDbContext<FartSocialDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            options.UseSqlServer(connectionString, sql =>
            {
                sql.MigrationsAssembly(typeof(FartSocialDbContext).Assembly.FullName);
                sql.EnableRetryOnFailure();
            });
        });

        services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
        services.AddScoped<JwtTokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IBadgeService, BadgeService>();
        services.AddScoped<IEconomyService, EconomyService>();
        services.AddScoped<IDeviceService, DeviceService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<ILeaderboardService, LeaderboardService>();
        services.AddScoped<ISocialService, SocialService>();
        services.AddScoped<IFartEventService, FartEventService>();
        services.AddScoped<IFartEventReadService, FartEventService>();
        services.AddScoped<ILootBoxService, LootBoxService>();
        services.AddScoped<AuthSeeder>();

        return services;
    }
}
