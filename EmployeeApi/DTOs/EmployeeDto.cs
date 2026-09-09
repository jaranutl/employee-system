public record EmployeeCreateDto(
    int Department_ID,
    string Employee_First_name,
    string Employee_Last_Name,
    string? Gender,
    DateTime? Date_of_Birth,
    DateTime Date_Joined,
    string? Employee_Address,
    IFormFile? PhotoFile
);

public record EmployeeUpdateDto(
     int Department_ID,
    string Employee_First_name,
    string Employee_Last_Name,
    string? Gender,
    DateTime? Date_of_Birth,
    DateTime Date_Joined,
    string? Employee_Address,
    IFormFile? PhotoFile
);