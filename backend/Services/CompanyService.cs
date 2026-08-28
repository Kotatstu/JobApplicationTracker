using backend.Data;
using backend.DTOs;
using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using Microsoft.EntityFrameworkCore.Storage.Internal;

namespace backend.Services;

public class CompanyService : ICompanyService
{
    
    private readonly AppDbContext _context;

    //dependency injection
    public CompanyService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CompanyResponseDTO>> GetAllAsync()
    {
        return await _context.Companies.Select(c => new CompanyResponseDTO
        {
            Id = c.Id,
            CompanyName = c.CompanyName,
            WebsiteUrl = c.WebsiteUrl,
            Industry = c.Industry
        })
        .ToListAsync();
    }

    private static CompanyResponseDTO MapToDTO(Company c) => new()
    {
        Id = c.Id,
        CompanyName = c.CompanyName,
        WebsiteUrl = c.WebsiteUrl,
        Industry = c.Industry
    };

    public async Task<(CompanyResponseDTO Company, bool WasCreated)> CreateAsync(CompanyCreateDTO dto)
    {
        //First step is to check the company name, avoiding case like Google, gOOglE,...
        var normolizedName = dto.CompanyName.Trim();
        var existing = await _context.Companies.FirstOrDefaultAsync(c =>
            c.UserId == dto.UserId && c.CompanyName.ToLower() == normolizedName.ToLower());

        //if company name is relatively exist, will not create
        if(existing != null)
        {
            return (MapToDTO(existing), false);
        }
        
        var company = new Company
        {
            UserId = dto.UserId,
            CompanyName = normolizedName,
            WebsiteUrl = dto.WebsiteUrl,
            Industry = dto.Industry
        };

        _context.Companies.Add(company);
        await _context.SaveChangesAsync();

        return (MapToDTO(company), true);
    }

    public async Task<CompanyResponseDTO?> GetByIdAsync(int id)
    {
        var company = await _context.Companies.FindAsync(id);

        if(company == null)
            return null;

        return MapToDTO(company);
    }

    public async Task<(CompanyResponseDTO?, CompanyUpdateResult)> UpdateByIdAsync(int id, Guid userId, CompanyUpdateDTO dto)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == id);
        if(company is null)
            return (null, CompanyUpdateResult.NotFound);

        //Check duplicate companyname
        var normalizedName = dto.CompanyName.Trim();
        var existing = await _context.Companies.AnyAsync(c =>
            c.Id != id && 
            c.CompanyName.ToLower() == normalizedName.ToLower() &&
            c.UserId == userId);

        if(existing)
            return (null, CompanyUpdateResult.DuplicateName);

        //Update CompanyName
        company.CompanyName = normalizedName;

        //if null -> check if user mean deleting the field or there is no change at all
        if(dto.WebsiteUrl is not null)
        {   
            if(dto.WebsiteUrl == "")
            {
                //Update WebsiteURL
                company.WebsiteUrl = null;
            }
            else
            {
                //Update WebsiteURL
                company.WebsiteUrl = dto.WebsiteUrl;
            }
        }

        if(dto.Industry is not null)
        {
            if(dto.Industry == "")
            {
                //Update Industry
                company.Industry = null;
            }
            else
            {
                //Update Industry
                company.Industry = dto.Industry;
            }
        }

        await _context.SaveChangesAsync();

        return (MapToDTO(company), CompanyUpdateResult.Success);
    }

    // public async Task<bool> DeleteByIdAsync(int id, Guid userId)
    // {
    //     var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
    //     if(company is null)
    //         return false;

    //     _context.Companies.Remove(company);
    //     await _context.SaveChangesAsync();

    //     return true;
    // }
}
