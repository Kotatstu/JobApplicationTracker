namespace backend.DTOs;

public enum JobApplicationUpdateResponse
{
    Success, //Successly update the JA
    NotFound, //Did not find the given id for JA
    CompanyNotFound, //Did not find the given if company (Can change the company field)
    InvalidJobTitle

}