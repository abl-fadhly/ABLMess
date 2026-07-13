namespace ABLMess.Api.Models;

public class HotelPlacement
{
    public int Id { get; set; }
    public int RequestId { get; set; }
    public Request? Request { get; set; }
    public string HotelName { get; set; } = string.Empty;
    public string HotelAddress { get; set; } = string.Empty;
    public DateOnly From { get; set; }
    public DateOnly To { get; set; }
    public string? Notes { get; set; }
    public int CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
    public DateTime CreatedAt { get; set; }
}
