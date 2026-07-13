using ABLMess.Api.Auth;
using ABLMess.Api.Data;
using ABLMess.Api.Dtos;
using ABLMess.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ABLMess.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AblMessDbContext db, TokenService tokenService, IPasswordHasher<User> passwordHasher) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user is null)
        {
            return Unauthorized();
        }

        var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized();
        }

        var token = tokenService.CreateToken(user);
        return Ok(new LoginResponse(token, user.ToDto()));
    }
}
