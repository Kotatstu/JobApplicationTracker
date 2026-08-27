using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{   
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
        
    }

    public DbSet<Company> Companies { get; set; }
    public DbSet<JobApplication> JobApplications { get; set;}
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Company>(entity =>
        {
            entity.HasIndex(c => new { c.UserId, c.CompanyName}).IsUnique();
        });

        //Many to one relationship, restrict delete
        modelBuilder.Entity<JobApplication>(entity =>
        {
           entity.HasOne(ja => ja.Company)
           .WithMany()
           .HasForeignKey(ja => ja.CompanyId)
           .OnDelete(DeleteBehavior.Restrict);
        });
    }
}