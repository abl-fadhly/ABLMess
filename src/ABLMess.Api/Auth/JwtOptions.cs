namespace ABLMess.Api.Auth;

public class JwtOptions
{
    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = "ABLMess";
    public string Audience { get; set; } = "ABLMess";
    public int ExpiryMinutes { get; set; } = 480;
}
