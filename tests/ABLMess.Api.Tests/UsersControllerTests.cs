using ABLMess.Api.Controllers;
using ABLMess.Api.Data;
using ABLMess.Api.Dtos;
using ABLMess.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace ABLMess.Api.Tests;

public class UsersControllerTests
{
    private static readonly IPasswordHasher<User> Hasher = new PasswordHasher<User>();

    private static (UsersController controller, AblMessDbContext db, User seededUser) SetUp(string role = "GS")
    {
        var db = TestDbFactory.Create();
        var seededUser = new User { FirstName = "Seed", LastName = "User", Email = "seed@x.com", UserType = UserType.Crew };
        seededUser.PasswordHash = Hasher.HashPassword(seededUser, "OldPassword1!");
        db.Users.Add(seededUser);
        db.SaveChanges();

        var controller = new UsersController(db, Hasher);
        TestAuthHelper.SetUser(controller, seededUser.Id, role);
        return (controller, db, seededUser);
    }

    [Fact]
    public async Task Create_AddsUser_WithHashedPassword()
    {
        var (controller, db, _) = SetUp();

        var result = await controller.Create(new CreateUserRequest("New", "Crew", Gender.Male, null, null, "0800", UserType.Crew, "new@x.com", "Password1!", null));

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var dto = Assert.IsType<UserDto>(created.Value);
        Assert.Equal("new@x.com", dto.Email);

        var stored = await db.Users.FindAsync(dto.Id);
        Assert.NotEqual("Password1!", stored!.PasswordHash);
    }

    [Fact]
    public async Task GetAll_ReturnsAllUsers()
    {
        var (controller, _, _) = SetUp();

        var result = await controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<IEnumerable<UserDto>>(ok.Value).ToList();
        Assert.Single(list);
    }

    [Fact]
    public async Task Update_ChangesUserFields()
    {
        var (controller, db, seededUser) = SetUp();

        var result = await controller.Update(seededUser.Id, new UpdateUserRequest("Updated", "Name", Gender.Female, null, null, "0811", UserType.GS, "updated@x.com", null));

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<UserDto>(ok.Value);
        Assert.Equal("Updated", dto.FirstName);
        Assert.Equal(UserType.GS, dto.UserType);
    }

    [Fact]
    public async Task Update_ReturnsNotFound_ForMissingUser()
    {
        var (controller, _, _) = SetUp();

        var result = await controller.Update(9999, new UpdateUserRequest("A", "B", Gender.Male, null, null, "0", UserType.Crew, "x@x.com", null));

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Delete_RemovesUser()
    {
        var (controller, db, seededUser) = SetUp();

        var result = await controller.Delete(seededUser.Id);

        Assert.IsType<NoContentResult>(result);
        Assert.Null(await db.Users.FindAsync(seededUser.Id));
    }

    [Fact]
    public async Task ResetPassword_ChangesStoredHash()
    {
        var (controller, db, seededUser) = SetUp();
        var originalHash = seededUser.PasswordHash;

        var result = await controller.ResetPassword(seededUser.Id, new ResetPasswordRequest("BrandNew1!"));

        Assert.IsType<NoContentResult>(result);
        var reloaded = await db.Users.FindAsync(seededUser.Id);
        Assert.NotEqual(originalHash, reloaded!.PasswordHash);
    }

    [Fact]
    public async Task GetMe_ReturnsCurrentUser()
    {
        var (controller, _, seededUser) = SetUp(role: "Crew");

        var result = await controller.GetMe();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<UserDto>(ok.Value);
        Assert.Equal(seededUser.Id, dto.Id);
    }

    [Fact]
    public async Task UpdateMe_ChangesOwnProfile()
    {
        var (controller, _, seededUser) = SetUp(role: "Crew");

        var result = await controller.UpdateMe(new UpdateProfileRequest("Self", "Updated", "0822", "self@x.com", null));

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<UserDto>(ok.Value);
        Assert.Equal("Self", dto.FirstName);
        Assert.Equal(seededUser.Id, dto.Id);
    }

    [Fact]
    public async Task ChangeMyPassword_Fails_WhenCurrentPasswordWrong()
    {
        var (controller, _, _) = SetUp(role: "Crew");

        var result = await controller.ChangeMyPassword(new ChangePasswordRequest("WrongCurrent!", "NewPassword1!"));

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task ChangeMyPassword_Succeeds_WhenCurrentPasswordCorrect()
    {
        var (controller, db, seededUser) = SetUp(role: "Crew");

        var result = await controller.ChangeMyPassword(new ChangePasswordRequest("OldPassword1!", "NewPassword1!"));

        Assert.IsType<NoContentResult>(result);
        var reloaded = await db.Users.FindAsync(seededUser.Id);
        var verify = Hasher.VerifyHashedPassword(reloaded!, reloaded!.PasswordHash, "NewPassword1!");
        Assert.Equal(PasswordVerificationResult.Success, verify);
    }
}
