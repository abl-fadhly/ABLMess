namespace ABLMess.Api.Models;

public class Request
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public DateOnly From { get; set; }
    public DateOnly To { get; set; }
    public RequestStatus Status { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Booking? Booking { get; set; }
    public HotelPlacement? HotelPlacement { get; set; }
}
