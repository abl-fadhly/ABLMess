using ABLMess.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ABLMess.Api.Data;

public static class SeedData
{
    public static async Task EnsureInitialAdminAsync(AblMessDbContext db, IPasswordHasher<User> passwordHasher, IConfiguration configuration)
    {
        await db.Database.MigrateAsync();

        if (await db.Users.AnyAsync())
        {
            return;
        }

        var email = configuration["InitialAdmin:Email"] ?? "admin@ablmess.local";
        var password = configuration["InitialAdmin:Password"] ?? "ChangeMe123!";

        var admin = new User
        {
            FirstName = "Admin",
            LastName = "User",
            Gender = Gender.Male,
            UserType = UserType.Admin,
            Email = email,
            Phone = string.Empty,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        admin.PasswordHash = passwordHasher.HashPassword(admin, password);

        db.Users.Add(admin);
        await db.SaveChangesAsync();
    }
}
