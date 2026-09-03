namespace backend.DTOs;

public enum GetJobPostingDetailResult
{
    Success,
    ApplicationNotFound, //Cant find the correct job application
    NoDetailsYet // Found the job application but there is no job posting details yet
}