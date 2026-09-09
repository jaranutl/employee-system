namespace EmployeeApi.Models;
public class Employee
{
    public int Employee_ID { get; set; }
    public int Department_ID { get; set; }
    public string Employee_First_name { get; set; } = string.Empty;
    public string Employee_Last_Name { get; set; } = string.Empty;
    public string? Gender { get; set; }
    public DateTime? Date_of_Birth { get; set; }
    public DateTime Date_Joined { get; set; }
    public string? Employee_Address { get; set; }
    public string? Photo { get; set; }

    public Department? Department { get; set; }
}