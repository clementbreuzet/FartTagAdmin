using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace FartSocial.Api.Middleware;

/// <summary>
/// Converts unhandled application exceptions into consistent HTTP error responses.
/// </summary>
/// <param name="logger">The middleware logger.</param>
public sealed class ExceptionHandlingMiddleware(ILogger<ExceptionHandlingMiddleware> logger) : IMiddleware
{
    /// <summary>Executes the next middleware and handles any exception it throws.</summary>
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (ValidationException exception)
        {
            logger.LogWarning(exception, "Validation failed");
            await WriteProblemDetailsAsync(context, StatusCodes.Status400BadRequest, "Validation failed", exception.Errors.Select(error => error.ErrorMessage).ToArray());
        }
        catch (UnauthorizedAccessException exception)
        {
            logger.LogWarning(exception, "Unauthorized access");
            await WriteProblemDetailsAsync(context, StatusCodes.Status401Unauthorized, exception.Message);
        }
        catch (InvalidOperationException exception)
        {
            logger.LogWarning(exception, "Invalid operation");
            await WriteProblemDetailsAsync(context, StatusCodes.Status400BadRequest, exception.Message);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Unhandled exception");
            await WriteProblemDetailsAsync(context, StatusCodes.Status500InternalServerError, "Une erreur inattendue est survenue.");
        }
    }

    private static async Task WriteProblemDetailsAsync(HttpContext context, int statusCode, string title, string[]? errors = null)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Instance = context.Request.Path,
        };

        if (errors is { Length: > 0 })
        {
            problem.Extensions["errors"] = errors;
        }

        await context.Response.WriteAsJsonAsync(problem);
    }
}
