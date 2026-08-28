using backend.Data;
using backend.DTOs;
using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
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
        CompanyName = ja.Company.CompanyName,
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
    public async Task<List<JobApplicationResponseDTO>> GetAllAsync(Guid userId)
    {
        return await _context.JobApplications
            //.Include(ja => ja.Company) Not nesessary because .Select already call for DTO that have .Company.CompanyName
            .Where(ja => ja.UserId == userId)
            .Select(ja => new JobApplicationResponseDTO
            {
                Id = ja.Id,
                CompanyId = ja.CompanyId,
                CompanyName = ja.Company.CompanyName,
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

    public async Task<JobApplicationResponseDTO?> GetByIdAsync(int id, Guid userId)
    {
        var ja = await _context.JobApplications
            .Include(ja => ja.Company)
            .FirstOrDefaultAsync(ja =>
                ja.Id == id &&
                ja.UserId == userId);

        if(ja == null)
            return null;

        return MapToDTO(ja);
    }    

    public async Task<(JobApplicationResponseDTO?, JobApplicationCreateResult)> CreateAsync(JobApplicationCreateDTO dto, Guid userId)
    {
        //Check if the COMPANY id exist
        var existing = await _context.Companies.FirstOrDefaultAsync(c => 
            c.Id == dto.CompanyId &&
            c.UserId == userId);

        if(existing is null)
            return (null, JobApplicationCreateResult.CompanyNotFound);

        var ja = new JobApplication
        {
            UserId = userId,
            CompanyId = dto.CompanyId,
            JobTitle = dto.JobTitle,
            JobPostingUrl = dto.JobPostingUrl,
            Location = dto.Location,
            DateApplied = dto.DateApplied,
            CurrentStatus = "Applied",
            CreateVia = "Manual",
            Notes = dto.Notes
        };

        _context.JobApplications.Add(ja);
        await _context.SaveChangesAsync();

        return (MapToDTO(ja), JobApplicationCreateResult.Success);
    }

}