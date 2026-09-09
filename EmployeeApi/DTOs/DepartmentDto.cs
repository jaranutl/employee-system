namespace EmployeeApi.DTOs;

public record DepartmentCreateDto(
    string Department_Name,
    string? Department_Address
);