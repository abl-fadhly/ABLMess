using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi.Models;

namespace ABLMess.Api;

public class OpenApiBearerSecuritySchemeTransformer : IOpenApiDocumentTransformer
{
    public Task TransformAsync(OpenApiDocument document, OpenApiDocumentTransformerContext context, CancellationToken cancellationToken)
    {
        var scheme = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Paste the JWT returned from POST /api/auth/login."
        };

        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes["Bearer"] = scheme;

        document.SecurityRequirements.Add(new OpenApiSecurityRequirement
        {
            [new OpenApiSecurityScheme { Reference = new OpenApiReference { Id = "Bearer", Type = ReferenceType.SecurityScheme } }] = []
        });

        return Task.CompletedTask;
    }
}
