namespace ABLMess.Api.Dtos;

public record LoginRequest(string Email, string Password);

public record LoginResponse(string Token, UserDto User);
