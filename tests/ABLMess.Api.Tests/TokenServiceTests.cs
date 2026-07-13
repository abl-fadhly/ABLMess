using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using ABLMess.Api.Auth;
using ABLMess.Api.Models;
using Xunit;

namespace ABLMess.Api.Tests;

public class TokenServiceTests
{
    [Fact]
    public void CreateToken_IncludesUserIdEmailAndRoleClaims()
    {
        var sut = new TokenService(TestJwtOptions.Default);
        var user = new User { Id = 42, Email = "gs@x.com", UserType = UserType.GS, FirstName = "G", LastName = "S" };

        var token = sut.CreateToken(user);

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        Assert.Equal("42", jwt.Claims.First(c => c.Type == JwtRegisteredClaimNames.Sub).Value);
        Assert.Equal("gs@x.com", jwt.Claims.First(c => c.Type == ClaimTypes.Email).Value);
        Assert.Equal("GS", jwt.Claims.First(c => c.Type == ClaimTypes.Role).Value);
    }

    [Fact]
    public void CreateToken_SetsExpiryInTheFuture()
    {
        var sut = new TokenService(TestJwtOptions.Default);
        var user = new User { Id = 1, Email = "a@x.com", UserType = UserType.Admin, FirstName = "A", LastName = "B" };

        var token = sut.CreateToken(user);

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        Assert.True(jwt.ValidTo > DateTime.UtcNow);
    }
}
