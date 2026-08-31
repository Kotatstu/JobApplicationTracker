using System.Globalization;
using System.Security.Cryptography.X509Certificates;
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

        var history = new ApplicationStatusHistory
        {
            JobApplication = ja,

            Status = "Applied",
            ChangedAt = DateTime.Now,
            Note = null,
            Source = "Manual"
        };

        _context.ApplicationStatusHistory.Add(history);

        await _context.SaveChangesAsync();

        return (MapToDTO(ja), JobApplicationCreateResult.Success);
    }

    public async Task<(JobApplicationResponseDTO?, JobApplicationUpdateResponse)> UpdateByIdAsync(JobApplicationUpdateDTO dto, int id, Guid userId)
    {
        //Check if the updating id exist first
        var ja = await _context.JobApplications.Include(ja => ja.Company).FirstOrDefaultAsync(ja =>
            ja.Id == id &&
            ja.UserId == userId);
        
        if(ja == null)
            return (null, JobApplicationUpdateResponse.NotFound);

        //Check if we are updating the company ID or not.
        //If is updating the CompanyId field:
        if(dto.CompanyId != null && ja.CompanyId != dto.CompanyId)
        {
            var company = await _context.Companies.AnyAsync(c =>
                c.Id == dto.CompanyId &&
                c.UserId == userId);

            //If is updating company ID but the ID is wrong or not belong to the user then throw not found
            if(company == false)
                return (null, JobApplicationUpdateResponse.CompanyNotFound);
            
            ja.CompanyId = dto.CompanyId.Value;
        }

        //Updating other fiels/or not
        if(dto.JobTitle != null)
        {
            if(dto.JobTitle.Trim() == "")
            {
                return (null, JobApplicationUpdateResponse.InvalidJobTitle);
            }
            ja.JobTitle = dto.JobTitle;
        }
        if(dto.JobPostingUrl != null)
        {
            ja.JobPostingUrl = dto.JobPostingUrl;
        }
        if(dto.Location != null)
        {
            ja.Location = dto.Location;
        }
        if(dto.DateApplied != null)
        {
            ja.DateApplied = dto.DateApplied.Value;
        }
        if(dto.Notes != null)
        {
            ja.Notes = dto.Notes;
        }

        ja.UpdatedAt = DateTime.Now;

        await _context.SaveChangesAsync();
        return (MapToDTO(ja), JobApplicationUpdateResponse.Success);
    }

    public async Task<(JobApplicationResponseDTO?, UpdateStatusResult)> UpdateStatusAsync(ChangeStatusDTO dto, int id, Guid userId)
    {
        var ja = await _context.JobApplications
            .Include(ja => ja.Company)
            .FirstOrDefaultAsync(ja =>
                ja.Id == id &&
                ja.UserId == userId);

        if(ja == null)
            return (null, UpdateStatusResult.NotFound);

        if(dto.Status.Trim() == "")
            return (null, UpdateStatusResult.InvalidStatus);

        ja.CurrentStatus = dto.Status;
        ja.UpdatedAt = DateTime.Now;

        var h = new ApplicationStatusHistory
        {
            JobApplicationId = id,
            Status = dto.Status,
            ChangedAt = DateTime.Now,
            Note = dto.Note,
            Source = "Manual",
        };

        _context.ApplicationStatusHistory.Add(h);
        await _context.SaveChangesAsync();

        return (MapToDTO(ja), UpdateStatusResult.Success);
    }

    public async Task<(List<StatusHistoryEntryDTO>?, GetStatusHistoryResult)> GetStatusHistoryById(int id, Guid userId)
    {
        var historyExists = await _context.JobApplications
            .AnyAsync(ja => ja.Id == id && ja.UserId == userId);

        if (historyExists == false)
            return (null, GetStatusHistoryResult.NotFound);

        var history = await _context.ApplicationStatusHistory
            .Where(h => h.JobApplicationId == id)
            .OrderBy(h => h.ChangedAt)
            .Select(h => new StatusHistoryEntryDTO
            {
                Id = h.Id,
                Status = h.Status,
                ChangedAt = h.ChangedAt,
                Note = h.Note,
                Source = h.Source
            })
            .ToListAsync();

        return (history, GetStatusHistoryResult.Success);
    }
}
