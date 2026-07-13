namespace ABLMess.Api.Models;

public class Booking
{
    public int Id { get; set; }
    public int RequestId { get; set; }
    public Request? Request { get; set; }
    public int BedId { get; set; }
    public Bed? Bed { get; set; }
    public DateOnly From { get; set; }
    public DateOnly To { get; set; }
    public BookingStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
