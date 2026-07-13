using ABLMess.Api.Models;

namespace ABLMess.Api.Dtos;

public record UserDto(
    int Id,
    string FirstName,
    string LastName,
    Gender Gender,
    int? ShipId,
    int? JabatanId,
    string Phone,
    UserType UserType,
    string Email);

public record CreateUserRequest(
    string FirstName,
    string LastName,
    Gender Gender,
    int? ShipId,
    int? JabatanId,
    string Phone,
    UserType UserType,
    string Email,
    string Password);

public record UpdateUserRequest(
    string FirstName,
    string LastName,
    Gender Gender,
    int? ShipId,
    int? JabatanId,
    string Phone,
    UserType UserType,
    string Email);

public record ResetPasswordRequest(string NewPassword);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

public record UpdateProfileRequest(
    string FirstName,
    string LastName,
    string Phone,
    string Email);
