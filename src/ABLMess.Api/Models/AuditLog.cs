namespace ABLMess.Api.Models;

public class AuditLog
{
    public int Id { get; set; }
    public AuditActionType ActionType { get; set; }
    public string Description { get; set; } = string.Empty;
    public int? ActorUserId { get; set; }
    public User? ActorUser { get; set; }
    public int? SubjectUserId { get; set; }
    public User? SubjectUser { get; set; }
    public DateTime CreatedAt { get; set; }
}
