using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : IdentityDbContext<IdentityUser<Guid>, IdentityRole<Guid>, Guid>
{   
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
        
    }

    public DbSet<Company> Companies { get; set;}
    public DbSet<JobApplication> JobApplications { get; set;}
    public DbSet<ApplicationStatusHistory> ApplicationStatusHistory { get; set;}
    public DbSet<JobPostingDetails> JobPostingDetails { get; set;}
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Company>(entity =>
        {
            entity.HasIndex(c => new { c.UserId, c.CompanyName}).IsUnique();
        });

        //A JobApplication has one company tied to it, restrict delete
        modelBuilder.Entity<JobApplication>(entity =>
        {
           entity.HasOne(ja => ja.Company)
           .WithMany()
           .HasForeignKey(ja => ja.CompanyId)
           .OnDelete(DeleteBehavior.Restrict);
        });

        //A ApplicationStatusHistroy has one JobApplication tied to it, will get deleted along with JA
        modelBuilder.Entity<ApplicationStatusHistory>(entity =>
        {
           entity.HasOne(h => h.JobApplication)
            .WithMany()
            .HasForeignKey(h => h.JobApplicationId)
            .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<JobPostingDetails>(entity =>
        {
            entity.HasOne(d => d.JobApplication)
            .WithOne()
            .HasForeignKey<JobPostingDetails>(d => d.JobApplicationId)//<> Telling which table hold the FK
            .OnDelete(DeleteBehavior.Cascade);

            //Doesnt need .HasIndex...IsUnique EF
        });
    }
}