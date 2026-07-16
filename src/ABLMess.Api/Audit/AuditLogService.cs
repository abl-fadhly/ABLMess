using ABLMess.Api.Data;
using ABLMess.Api.Models;

namespace ABLMess.Api.Audit;

public class AuditLogService(AblMessDbContext db)
{
    // Stages the entry only; the caller's own SaveChangesAsync() persists it alongside the
    // rest of that request's changes so the log write is atomic with the action it records.
    public void Log(AuditActionType actionType, string description, int? actorUserId = null, int? subjectUserId = null)
    {
        db.AuditLogs.Add(new AuditLog
        {
            ActionType = actionType,
            Description = description,
            ActorUserId = actorUserId,
            SubjectUserId = subjectUserId,
            CreatedAt = DateTime.UtcNow
        });
    }
}
