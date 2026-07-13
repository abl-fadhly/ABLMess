namespace ABLMess.Api.Notifications;

public interface IEmailSender
{
    Task<bool> SendAsync(string toEmail, string subject, string body, CancellationToken cancellationToken = default);
}
