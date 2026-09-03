namespace backend.Models;

public class JobPostingDetails
{
    public int Id { get; set; }
    public int JobApplicationId { get; set; }
    public string RawText { get; set; } = string.Empty;
    public string? DetailsJson { get; set; }
    public DateTime CreatedAt { get; set; }

    public JobApplication JobApplication { get; set; } = null!;
}