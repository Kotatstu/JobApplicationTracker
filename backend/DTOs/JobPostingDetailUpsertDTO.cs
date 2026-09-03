using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class JobPostingDetailUpsertDTO
{
    [Required]
    public string RawText { get; set; } = string.Empty;
    public string? DetailsJson { get; set; }
}