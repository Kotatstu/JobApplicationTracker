namespace backend.DTOs;

public class JobPostingDetailReponseDTO
{
    public int Id { get; set; }
    public int JobApplicationId { get; set; }
    public string RawText { get; set; } = string.Empty;
    public string? DetailsJson { get; set; }
    public DateTime CreatedAt { get; set; }
}