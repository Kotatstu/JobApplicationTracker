namespace backend.DTOs;

public class StatusHistoryEntryDTO
{
    public int Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; }
    public string? Note { get; set; }
    public string Source { get; set; } = string.Empty;
}