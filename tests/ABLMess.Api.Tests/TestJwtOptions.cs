using ABLMess.Api.Auth;
using Microsoft.Extensions.Options;

namespace ABLMess.Api.Tests;

public static class TestJwtOptions
{
    public static IOptions<JwtOptions> Default => Microsoft.Extensions.Options.Options.Create(new JwtOptions
    {
        Key = "test-secret-key-that-is-long-enough-for-hmac-sha256",
        Issuer = "ABLMess-Test",
        Audience = "ABLMess-Test",
        ExpiryMinutes = 60
    });
}
