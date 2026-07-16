using ABLMess.Api.Models;

namespace ABLMess.Api.Dtos;

public static class UserMappingExtensions
{
    public static UserDto ToDto(this User user) => new(
        user.Id,
        user.FirstName,
        user.LastName,
        user.Gender,
        user.ShipId,
        user.JabatanId,
        user.Phone,
        user.UserType,
        user.Email,
        user.EmployeeCode,
        user.PhotoUrl);
}
