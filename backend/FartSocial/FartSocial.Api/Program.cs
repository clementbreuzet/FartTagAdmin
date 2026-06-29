using Azure.Identity;
using FartSocial.Api.Middleware;
using FartSocial.Application.Authorization;
using FartSocial.Application.Validation;
using FartSocial.Infrastructure;
using FartSocial.Infrastructure.Configuration;
using FartSocial.Infrastructure.Persistence;
using FartSocial.Infrastructure.Seeding;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var keyVaultUri = builder.Configuration["KeyVault:Uri"];
if (!string.IsNullOrWhiteSpace(keyVaultUri))
{
    builder.Configuration.AddAzureKeyVault(new Uri(keyVaultUri), new DefaultAzureCredential());
}

builder.Host.UseSerilog((context, services, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestDtoValidator>();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddScoped<ExceptionHandlingMiddleware>();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(PolicyNames.AdminAccess, policy => policy.RequireClaim("permission", PermissionNames.AdminAccess));
    foreach (var permission in FartSocial.Domain.Security.PermissionCatalog.All)
    {
        options.AddPolicy(permission, policy => policy.RequireClaim("permission", permission));
    }
});

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = true,
            ValidateIssuer = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidAudience = jwtOptions.Audience,
            ValidIssuer = jwtOptions.Issuer,
            IssuerSigningKey = signingKey,
            ClockSkew = TimeSpan.FromSeconds(30),
            NameClaimType = "unique_name",
            RoleClaimType = System.Security.Claims.ClaimTypes.Role,
        };
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Log.Warning(
                    context.Exception,
                    "JWT authentication failed for {Path}",
                    context.Request.Path);
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                Log.Warning(
                    "JWT challenge for {Path}. HasAuthorizationHeader={HasAuthorizationHeader}. Error={Error}. ErrorDescription={ErrorDescription}",
                    context.Request.Path,
                    context.Request.Headers.ContainsKey("Authorization"),
                    context.Error,
                    context.ErrorDescription);
                return Task.CompletedTask;
            },
        };
    });

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "FartSocial API", Version = "v1" });
    options.CustomSchemaIds(type => type.FullName?.Replace("+", "."));
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer",
                },
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddHttpContextAccessor();

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseSerilogRequestLogging();
app.UseDeveloperExceptionPage();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();

app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api/admin"))
    {
        var permissionClaim = context.User.Claims.FirstOrDefault(claim => claim.Type == "permission" && claim.Value == PermissionNames.AdminAccess);
        if (permissionClaim is null)
        {
            context.Response.StatusCode = context.User.Identity?.IsAuthenticated == true ? StatusCodes.Status403Forbidden : StatusCodes.Status401Unauthorized;
            return;
        }
    }

    await next();
});

app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    checkedAt = DateTimeOffset.UtcNow,
})).AllowAnonymous();

app.MapControllers();

await using (var scope = app.Services.CreateAsyncScope())
{
    var scriptRunner = scope.ServiceProvider.GetRequiredService<DatabaseScriptRunner>();
    await scriptRunner.RunAsync(CancellationToken.None);

    var seeder = scope.ServiceProvider.GetRequiredService<AuthSeeder>();
    await seeder.SeedAsync(CancellationToken.None);
    if (app.Environment.IsDevelopment())
    {
        await seeder.SeedDevelopmentUserAsync(CancellationToken.None);
    }
}

app.Run();
