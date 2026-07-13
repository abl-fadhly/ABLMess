using ABLMess.Api.Auth;
using ABLMess.Api.Controllers;
using ABLMess.Api.Dtos;
using ABLMess.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace ABLMess.Api.Tests;

public class AuthControllerTests
{
    private static readonly IPasswordHasher<User> Hasher = new PasswordHasher<User>();

    private static AuthController BuildController(Data.AblMessDbContext db) =>
        new(db, new TokenService(TestJwtOptions.Default), Hasher);

    private static User SeedUser(Data.AblMessDbContext db, string email, string password, UserType type = UserType.Crew)
    {
        var user = new User { FirstName = "T", LastName = "User", Email = email, UserType = type };
        user.PasswordHash = Hasher.HashPassword(user, password);
        db.Users.Add(user);
        db.SaveChanges();
        return user;
    }

    [Fact]
    public async Task Login_Succeeds_WithCorrectCredentials()
    {
        var db = TestDbFactory.Create();
        SeedUser(db, "user@x.com", "Password123!");
        var controller = BuildController(db);

        var result = await controller.Login(new LoginRequest("user@x.com", "Password123!"));

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<LoginResponse>(ok.Value);
        Assert.False(string.IsNullOrWhiteSpace(dto.Token));
        Assert.Equal("user@x.com", dto.User.Email);
    }

    [Fact]
    public async Task Login_ReturnsUnauthorized_WithWrongPassword()
    {
        var db = TestDbFactory.Create();
        SeedUser(db, "user2@x.com", "Password123!");
        var controller = BuildController(db);

        var result = await controller.Login(new LoginRequest("user2@x.com", "WrongPassword!"));

        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public async Task Login_ReturnsUnauthorized_WithUnknownEmail()
    {
        var db = TestDbFactory.Create();
        var controller = BuildController(db);

        var result = await controller.Login(new LoginRequest("nobody@x.com", "whatever"));

        Assert.IsType<UnauthorizedResult>(result.Result);
    }
}
