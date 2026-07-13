using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;

namespace ABLMess.Api.Notifications;

public class SmtpEmailSender(IOptions<SmtpOptions> options, ILogger<SmtpEmailSender> logger) : IEmailSender
{
    private readonly SmtpOptions _options = options.Value;

    public async Task<bool> SendAsync(string toEmail, string subject, string body, CancellationToken cancellationToken = default)
    {
        try
        {
            using var client = new SmtpClient(_options.Host, _options.Port)
            {
                Credentials = new NetworkCredential(_options.Username, _options.Password),
                EnableSsl = true
            };

            using var message = new MailMessage
            {
                From = new MailAddress(_options.FromAddress, _options.FromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = false
            };
            message.To.Add(toEmail);

            await client.SendMailAsync(message, cancellationToken);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email to {ToEmail}", toEmail);
            return false;
        }
    }
}
