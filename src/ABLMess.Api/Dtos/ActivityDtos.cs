using ABLMess.Api.Models;

namespace ABLMess.Api.Dtos;

public record ActivityDto(
    int Id,
    AuditActionType ActionType,
    string Description,
    string? ActorUserFullName,
    string? SubjectUserFullName,
    DateTime CreatedAt);
