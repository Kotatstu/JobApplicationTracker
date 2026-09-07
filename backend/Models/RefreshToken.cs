namespace backend.Models;

public class RefreshToken
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? RevokedAt { get; set; }
    public int? ReplacedByTokenId { get; set; }
}