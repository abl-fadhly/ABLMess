using ABLMess.Api.Models;
using ABLMess.Api.Notifications;
using Xunit;
using BookingModel = ABLMess.Api.Models.Booking;
using RequestModel = ABLMess.Api.Models.Request;

namespace ABLMess.Api.Tests;

public class NotificationServiceTests
{
    private static (NotificationService service, Data.AblMessDbContext db, FakeEmailSender sender, User crew, RequestModel request) SetUp()
    {
        var db = TestDbFactory.Create();
        var crew = new User { FirstName = "Crew", LastName = "One", Email = "crew@x.com", UserType = UserType.Crew };
        db.Users.Add(crew);
        var request = new RequestModel { User = crew, From = new DateOnly(2026, 1, 1), To = new DateOnly(2026, 1, 5), Status = RequestStatus.Booked };
        db.Requests.Add(request);
        db.SaveChanges();

        var sender = new FakeEmailSender();
        var service = new NotificationService(db, sender);
        return (service, db, sender, crew, request);
    }

    [Fact]
    public async Task NotifyRequestBooked_SendsEmail_AndLogsNotification()
    {
        var (service, db, sender, crew, request) = SetUp();

        await service.NotifyRequestBookedAsync(request.Id);

        Assert.Single(sender.SentEmails);
        Assert.Equal(crew.Email, sender.SentEmails[0].To);

        var log = Assert.Single(db.Notifications);
        Assert.Equal(NotificationType.RequestBooked, log.Type);
        Assert.True(log.Success);
        Assert.Equal(request.Id, log.RequestId);
    }

    [Fact]
    public async Task NotifyClockInReminder_SendsEmail_AndLogsWithBookingId()
    {
        var (service, db, sender, crew, request) = SetUp();
        var bed = new Bed { BedName = "B1", Room = new Room { RoomName = "R1", Location = new Location { LocationName = "L1", LocationAddress = "A" } } };
        var booking = new BookingModel { Request = request, Bed = bed, From = request.From, To = request.To, Status = BookingStatus.Booked };
        db.Beds.Add(bed);
        db.Bookings.Add(booking);
        await db.SaveChangesAsync();

        await service.NotifyClockInReminderAsync(booking);

        Assert.Single(sender.SentEmails);
        var log = Assert.Single(db.Notifications);
        Assert.Equal(NotificationType.ClockInReminder, log.Type);
        Assert.Equal(booking.Id, log.BookingId);
    }

    [Fact]
    public async Task NotifyClockOutReminder_SendsEmail_AndLogsWithBookingId()
    {
        var (service, db, sender, crew, request) = SetUp();
        var bed = new Bed { BedName = "B1", Room = new Room { RoomName = "R1", Location = new Location { LocationName = "L1", LocationAddress = "A" } } };
        var booking = new BookingModel { Request = request, Bed = bed, From = request.From, To = request.To, Status = BookingStatus.ClockIn };
        db.Beds.Add(bed);
        db.Bookings.Add(booking);
        await db.SaveChangesAsync();

        await service.NotifyClockOutReminderAsync(booking);

        Assert.Single(sender.SentEmails);
        var log = Assert.Single(db.Notifications);
        Assert.Equal(NotificationType.ClockOutReminder, log.Type);
        Assert.Equal(booking.Id, log.BookingId);
    }

    [Fact]
    public async Task NotifyRequestBooked_LogsFailure_WhenEmailSendFails()
    {
        var db = TestDbFactory.Create();
        var crew = new User { FirstName = "Crew", LastName = "One", Email = "crew@x.com", UserType = UserType.Crew };
        db.Users.Add(crew);
        var request = new RequestModel { User = crew, From = new DateOnly(2026, 1, 1), To = new DateOnly(2026, 1, 5), Status = RequestStatus.Booked };
        db.Requests.Add(request);
        await db.SaveChangesAsync();

        var service = new NotificationService(db, new AlwaysFailingEmailSender());

        await service.NotifyRequestBookedAsync(request.Id);

        var log = Assert.Single(db.Notifications);
        Assert.False(log.Success);
    }

    private class AlwaysFailingEmailSender : IEmailSender
    {
        public Task<bool> SendAsync(string toEmail, string subject, string body, CancellationToken cancellationToken = default)
            => Task.FromResult(false);
    }
}
