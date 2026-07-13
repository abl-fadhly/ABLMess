using ABLMess.Api.Data;
using ABLMess.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ABLMess.Api.Notifications;

public class NotificationService(AblMessDbContext db, IEmailSender emailSender)
{
    public async Task NotifyRequestBookedAsync(int requestId, CancellationToken cancellationToken = default)
    {
        var request = await db.Requests
            .Include(r => r.User)
            .FirstAsync(r => r.Id == requestId, cancellationToken);

        var subject = "Your mess room request has been booked";
        var body = $"Hi {request.User!.FirstName}, your room request for {request.From:yyyy-MM-dd} to {request.To:yyyy-MM-dd} has been booked.";

        await SendAndLogAsync(request.User, NotificationType.RequestBooked, requestId: request.Id, bookingId: null, subject, body, cancellationToken);
    }

    public async Task NotifyClockInReminderAsync(Booking booking, CancellationToken cancellationToken = default)
    {
        var user = await GetBookingUserAsync(booking, cancellationToken);
        var subject = "Reminder: clock-in tomorrow";
        var body = $"Hi {user.FirstName}, this is a reminder that you're scheduled to clock in tomorrow ({booking.From:yyyy-MM-dd}).";

        await SendAndLogAsync(user, NotificationType.ClockInReminder, requestId: booking.RequestId, bookingId: booking.Id, subject, body, cancellationToken);
    }

    public async Task NotifyClockOutReminderAsync(Booking booking, CancellationToken cancellationToken = default)
    {
        var user = await GetBookingUserAsync(booking, cancellationToken);
        var subject = "Reminder: clock-out tomorrow";
        var body = $"Hi {user.FirstName}, this is a reminder that you're scheduled to clock out tomorrow ({booking.To:yyyy-MM-dd}).";

        await SendAndLogAsync(user, NotificationType.ClockOutReminder, requestId: booking.RequestId, bookingId: booking.Id, subject, body, cancellationToken);
    }

    private async Task<User> GetBookingUserAsync(Booking booking, CancellationToken cancellationToken)
    {
        return await db.Requests
            .Where(r => r.Id == booking.RequestId)
            .Select(r => r.User!)
            .FirstAsync(cancellationToken);
    }

    private async Task SendAndLogAsync(User user, NotificationType type, int? requestId, int? bookingId, string subject, string body, CancellationToken cancellationToken)
    {
        var success = await emailSender.SendAsync(user.Email, subject, body, cancellationToken);

        db.Notifications.Add(new Notification
        {
            UserId = user.Id,
            RequestId = requestId,
            BookingId = bookingId,
            Type = type,
            Channel = NotificationChannel.Email,
            SentAt = DateTime.UtcNow,
            Success = success
        });

        await db.SaveChangesAsync(cancellationToken);
    }
}
