using ABLMess.Api.Notifications;

namespace ABLMess.Api.Tests;

public class FakeEmailSender : IEmailSender
{
    public List<(string To, string Subject, string Body)> SentEmails { get; } = [];

    public Task<bool> SendAsync(string toEmail, string subject, string body, CancellationToken cancellationToken = default)
    {
        SentEmails.Add((toEmail, subject, body));
        return Task.FromResult(true);
    }
}
