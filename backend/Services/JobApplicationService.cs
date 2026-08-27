using backend.Data;
using backend.DTOs;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class JobApplicationService : IJobApplicationService
{
    private readonly AppDbContext _context;

    //DI
    public JobApplicationService(AppDbContext context)
    {
        _context = context;
    }

    private static JobApplicationResponseDTO MapToDTO(JobApplication ja) => new ()
    {
        Id = ja.Id,
        CompanyId = ja.CompanyId,
        JobTitle = ja.JobTitle,
        JobPostingUrl = ja.JobPostingUrl,
        Location = ja.Location,
        DateApplied = ja.DateApplied,
        CurrentStatus = ja.CurrentStatus,
        CreateVia = ja.CreateVia,
        Notes = ja.Notes,
        CreatedAt = ja.CreatedAt,
        UpdatedAt = ja.UpdatedAt
    };
    public async Task<List<JobApplicationResponseDTO>> GetAllAsync()
    {
        return await _context.JobApplications.Include(ja => ja.Company).Select(ja => new JobApplicationResponseDTO
        {
            Id = ja.Id,
            CompanyId = ja.CompanyId,
            JobTitle = ja.JobTitle,
            JobPostingUrl = ja.JobPostingUrl,
            Location = ja.Location,
            DateApplied = ja.DateApplied,
            CurrentStatus = ja.CurrentStatus,
            CreateVia = ja.CreateVia,
            Notes = ja.Notes,
            CreatedAt = ja.CreatedAt,
            UpdatedAt = ja.UpdatedAt
        })
        .ToListAsync();
    }
}