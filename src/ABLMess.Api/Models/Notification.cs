namespace ABLMess.Api.Models;

public enum NotificationType
{
    RequestBooked,
    ClockInReminder,
    ClockOutReminder
}

public enum NotificationChannel
{
    Email
}

public class Notification
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public int? BookingId { get; set; }
    public Booking? Booking { get; set; }
    public int? RequestId { get; set; }
    public Request? Request { get; set; }
    public NotificationType Type { get; set; }
    public NotificationChannel Channel { get; set; }
    public DateTime SentAt { get; set; }
    public bool Success { get; set; }
}
