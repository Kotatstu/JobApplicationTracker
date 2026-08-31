namespace backend.Models;

public class ApplicationStatusHistory
{
    public int Id { get; set; }
    public int JobApplicationId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; }
    public string? Note { get; set; }
    public string Source { get; set; } = "Manual";
    public int? SourceEmailId { get; set; } //Not implemant Uses yet

    public JobApplication JobApplication {get; set; } = null!;

}