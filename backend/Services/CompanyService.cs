using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class CompanyService : ICompanyService
{
    private readonly AppDbContext _context;

    public CompanyService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CompanyResponeDTO>> GetAllAsync()
    {
        return await _context.Companies.Select(c => new CompanyResponeDTO
        {
            Id = c.Id,
            CompanyName = c.CompanyName,
            WebstieUrl = c.WebstieUrl,
            Industry = c.Industry
        })
        .ToListAsync();
    }

    private static CompanyResponeDTO MapToDTO(Company c) => new()
    {
        Id = c.Id,
        CompanyName = c.CompanyName,
        WebstieUrl = c.WebstieUrl,
        Industry = c.Industry
    };

    public async Task<(CompanyResponeDTO Company, bool WasCreated)> CreateAsync(CompanyCreateDTO dto)
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
            WebstieUrl = dto.WebsiteUrl,
            Industry = dto.Industry
        };

        _context.Companies.Add(company);
        await _context.SaveChangesAsync();

        return (MapToDTO(company), true);
    }

    public async Task<CompanyResponeDTO?> GetByIdAsync(int id)
    {
        var company = await _context.Companies.FindAsync(id);

        if(company == null)
            return null;

        return MapToDTO(company);
    }
}
