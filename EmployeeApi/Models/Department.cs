using System.Text.Json.Serialization;

namespace EmployeeApi.Models;
public class Department
{
    public int Department_ID { get; set; }
    public string Department_Name { get; set; } = string.Empty;
    public string? Department_Address { get; set; }
    [JsonIgnore] // Swagger will hide this field from request bodies
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
}