using backend.Data;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ActionConstraints;

namespace backend.Controllers;

[ApiController]
[Route("api/companies")]
public class CompaniesController : ControllerBase
{
    private readonly ICompanyService _companyService;

    public CompaniesController(ICompanyService companyService)
    {
        _companyService = companyService;        
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var companise = await _companyService.GetAllAsync();

        return Ok(companise);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var company = await _companyService.GetByIdAsync(id);
        
        if(company is null)
            return NotFound();
        
        return Ok(company);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CompanyCreateDTO dto)
    {
        var (company, WasCreated) = await _companyService.CreateAsync(dto);

        if(WasCreated != true)
        {
            return Ok(company);//company already exist -> 200
        }

        return CreatedAtAction(nameof(GetById), new {id = company.Id}, company); // -> 201
    }
}