using backend.DTOs;
using backend.Interfaces;
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
    [Route("getAll/{userId}")]
    public async Task<IActionResult> GetAll([FromRoute] Guid userId)
    {
        var companise = await _companyService.GetAllAsync(userId);

        return Ok(companise);
    }

    [HttpGet("getById/{id}/{userId}")]
    public async Task<IActionResult> GetById([FromRoute] int id, [FromRoute] Guid userId)
    {
        var company = await _companyService.GetByIdAsync(id, userId);
        
        if(company is null)
            return NotFound();
        
        return Ok(company);
    }

    [HttpPost]
    [Route("create/{userId}")]
    public async Task<IActionResult> Create([FromBody] CompanyCreateDTO dto, [FromRoute] Guid userId)
    {
        var (company, WasCreated) = await _companyService.CreateAsync(dto, userId);
        var result = new CompanyCreateResult {Company = company, WasExisting = !WasCreated};

        if(WasCreated != true)
        {
            return Ok(result);//company already exist -> 200
        }

        return CreatedAtAction(nameof(GetById), new {id = company.Id, userId}, company); // -> 201
    }

    [HttpPut]
    [Route("update/{id}/{userId}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromRoute] Guid userId, [FromBody] CompanyUpdateDTO dto)
    {
        var (company, result) = await _companyService.UpdateByIdAsync(id, userId, dto);

        return result switch
        {
            CompanyUpdateResult.Success => Ok(company),
            CompanyUpdateResult.NotFound => NotFound(),
            CompanyUpdateResult.DuplicateName => Conflict("A company with this name already exists."),
            _ => throw new InvalidOperationException()
        };
    }

    // [HttpDelete]
    // [Route("{id}/{userId}")]
    // public async Task<IActionResult> Delete([FromRoute] int id, [FromRoute] Guid userId)
    // {
    //     if(await _companyService.DeleteByIdAsync(id, userId))
    //         return NoContent();

    //     return NotFound();
    // }
}