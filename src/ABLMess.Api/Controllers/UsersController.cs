using System.Security.Claims;
using ABLMess.Api.Data;
using ABLMess.Api.Dtos;
using ABLMess.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ABLMess.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController(AblMessDbContext db, IPasswordHasher<User> passwordHasher) : ControllerBase
{
    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private static readonly Dictionary<UserType, (string Prefix, int Base)> EmployeeCodeSchemes = new()
    {
        [UserType.Crew] = ("CRW", 1000),
        [UserType.GS] = ("GS", 2000),
        [UserType.Admin] = ("ADM", 9000),
    };

    private async Task<string> GenerateEmployeeCodeAsync(UserType type)
    {
        var (prefix, baseNumber) = EmployeeCodeSchemes[type];
        var existingCodes = await db.Users
            .Where(u => u.EmployeeCode.StartsWith(prefix + "-"))
            .Select(u => u.EmployeeCode)
            .ToListAsync();

        var maxNumber = existingCodes
            .Select(code => int.TryParse(code.AsSpan(prefix.Length + 1), out var n) ? n : 0)
            .DefaultIfEmpty(baseNumber)
            .Max();

        return $"{prefix}-{Math.Max(maxNumber, baseNumber) + 1}";
    }

    [HttpGet]
    [Authorize(Roles = "Admin,GS")]
    public async Task<ActionResult<List<UserDto>>> GetAll()
    {
        var users = await db.Users.ToListAsync();
        return Ok(users.Select(u => u.ToDto()));
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,GS")]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        var user = await db.Users.FindAsync(id);
        return user is null ? NotFound() : Ok(user.ToDto());
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetMe()
    {
        var user = await db.Users.FindAsync(CurrentUserId);
        return user is null ? NotFound() : Ok(user.ToDto());
    }

    [HttpPost]
    [Authorize(Roles = "Admin,GS")]
    public async Task<ActionResult<UserDto>> Create(CreateUserRequest request)
    {
        if (request.UserType == UserType.Admin)
        {
            return StatusCode(403, "Admin accounts cannot be created.");
        }

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Gender = request.Gender,
            ShipId = request.ShipId,
            JabatanId = request.JabatanId,
            Phone = request.Phone,
            UserType = request.UserType,
            Email = request.Email,
            EmployeeCode = await GenerateEmployeeCodeAsync(request.UserType),
            PhotoUrl = request.PhotoUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user.ToDto());
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,GS")]
    public async Task<ActionResult<UserDto>> Update(int id, UpdateUserRequest request)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        if (user.UserType == UserType.Admin)
        {
            return StatusCode(403, "Admin accounts cannot be edited.");
        }

        if (request.UserType == UserType.Admin)
        {
            return StatusCode(403, "Admin accounts cannot be created.");
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Gender = request.Gender;
        user.ShipId = request.ShipId;
        user.JabatanId = request.JabatanId;
        user.Phone = request.Phone;
        user.UserType = request.UserType;
        user.Email = request.Email;
        user.PhotoUrl = request.PhotoUrl;
        user.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(user.ToDto());
    }

    [HttpPut("me")]
    public async Task<ActionResult<UserDto>> UpdateMe(UpdateProfileRequest request)
    {
        var user = await db.Users.FindAsync(CurrentUserId);
        if (user is null)
        {
            return NotFound();
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Phone = request.Phone;
        user.Email = request.Email;
        user.PhotoUrl = request.PhotoUrl;
        user.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(user.ToDto());
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,GS")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        if (user.UserType == UserType.Admin)
        {
            return StatusCode(403, "Admin accounts cannot be deleted.");
        }

        db.Users.Remove(user);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/reset-password")]
    [Authorize(Roles = "Admin,GS")]
    public async Task<IActionResult> ResetPassword(int id, ResetPasswordRequest request)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        if (user.UserType == UserType.Admin)
        {
            return StatusCode(403, "Admin passwords cannot be reset here.");
        }

        user.PasswordHash = passwordHasher.HashPassword(user, request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("me/password")]
    public async Task<IActionResult> ChangeMyPassword(ChangePasswordRequest request)
    {
        var user = await db.Users.FindAsync(CurrentUserId);
        if (user is null)
        {
            return NotFound();
        }

        var verify = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);
        if (verify == PasswordVerificationResult.Failed)
        {
            return BadRequest("Current password is incorrect.");
        }

        user.PasswordHash = passwordHasher.HashPassword(user, request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }
}
