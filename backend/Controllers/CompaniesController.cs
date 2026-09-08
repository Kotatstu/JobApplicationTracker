using backend.DTOs;
using backend.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ActionConstraints;

namespace backend.Controllers;

[ApiController]
[Route("api/companies")]
public class CompaniesController : ApiControllerBase
{
    private readonly ICompanyService _companyService;

    public CompaniesController(ICompanyService companyService)
    {
        _companyService = companyService;        
    }

    [HttpGet]
    [Route("getAll")]
    public async Task<IActionResult> GetAll()
    {
        var companise = await _companyService.GetAllAsync(CurrentUserId);

        return Ok(companise);
    }

    [HttpGet("getById/{id}")]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        var company = await _companyService.GetByIdAsync(id, CurrentUserId);
        
        if(company is null)
            return NotFound();
        
        return Ok(company);
    }

    [HttpPost]
    [Route("create")]
    public async Task<IActionResult> Create([FromBody] CompanyCreateDTO dto)
    {
        var (company, WasCreated) = await _companyService.CreateAsync(dto, CurrentUserId);
        var result = new CompanyCreateResult {Company = company, WasExisting = !WasCreated};

        if(WasCreated != true)
        {
            return Ok(result);//company already exist -> 200
        }

        return CreatedAtAction(nameof(GetById), new {id = company.Id, CurrentUserId}, company); // -> 201
    }

    [HttpPut]
    [Route("update/{id}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] CompanyUpdateDTO dto)
    {
        var (company, result) = await _companyService.UpdateByIdAsync(id, CurrentUserId, dto);

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