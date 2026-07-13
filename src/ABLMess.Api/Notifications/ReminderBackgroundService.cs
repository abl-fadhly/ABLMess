using ABLMess.Api.Data;
using ABLMess.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ABLMess.Api.Notifications;

public class ReminderBackgroundService(IServiceScopeFactory scopeFactory, ILogger<ReminderBackgroundService> logger) : BackgroundService
{
    private static readonly TimeSpan CheckInterval = TimeSpan.FromHours(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RunOnceAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Reminder background service run failed");
            }

            await Task.Delay(CheckInterval, stoppingToken);
        }
    }

    private async Task RunOnceAsync(CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AblMessDbContext>();
        var notifications = scope.ServiceProvider.GetRequiredService<NotificationService>();

        var tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));

        var clockInCandidates = await db.Bookings
            .Where(b => b.From == tomorrow && b.Status == BookingStatus.Booked)
            .Where(b => !db.Notifications.Any(n => n.BookingId == b.Id && n.Type == NotificationType.ClockInReminder))
            .ToListAsync(cancellationToken);

        foreach (var booking in clockInCandidates)
        {
            await notifications.NotifyClockInReminderAsync(booking, cancellationToken);
        }

        var clockOutCandidates = await db.Bookings
            .Where(b => b.To == tomorrow && (b.Status == BookingStatus.Booked || b.Status == BookingStatus.ClockIn))
            .Where(b => !db.Notifications.Any(n => n.BookingId == b.Id && n.Type == NotificationType.ClockOutReminder))
            .ToListAsync(cancellationToken);

        foreach (var booking in clockOutCandidates)
        {
            await notifications.NotifyClockOutReminderAsync(booking, cancellationToken);
        }
    }
}
