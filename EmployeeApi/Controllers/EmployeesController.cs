using EmployeeApi.Data;
using EmployeeApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public EmployeesController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var employees = await _context.Employees.Include(e => e.Department).ToListAsync();
        return Ok(employees);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] EmployeeCreateDto dto)
    {
        string? photoPath = null;
        if (dto.PhotoFile != null)
        {
            var uploadDir = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            Directory.CreateDirectory(uploadDir);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.PhotoFile.FileName)}";
            var filePath = Path.Combine(uploadDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.PhotoFile.CopyToAsync(stream);
            }
            photoPath = $"/uploads/{fileName}";
        }

        var employee = new Employee
        {
            Department_ID = dto.Department_ID,
            Employee_First_name = dto.Employee_First_name,
            Employee_Last_Name = dto.Employee_Last_Name,
            Gender = dto.Gender,
            Date_of_Birth = dto.Date_of_Birth,
            Date_Joined = dto.Date_Joined,
            Employee_Address = dto.Employee_Address,
            Photo = photoPath
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = employee.Employee_ID }, employee);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromForm] EmployeeUpdateDto dto)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null)
        {
            return NotFound(new { message = $"Employee with ID {id} not found." });
        }

        // Handle photo replacement if a new file was uploaded
        if (dto.PhotoFile != null && dto.PhotoFile.Length > 0)
        {
            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadDir = Path.Combine(webRoot, "uploads");
            Directory.CreateDirectory(uploadDir);

            // Optional: Delete previous photo file from disk if it exists
            if (!string.IsNullOrEmpty(employee.Photo))
            {
                var oldFilePath = Path.Combine(webRoot, employee.Photo.TrimStart('/'));
                if (System.IO.File.Exists(oldFilePath))
                {
                    System.IO.File.Delete(oldFilePath);
                }
            }

            // Save new photo
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.PhotoFile.FileName)}";
            var newFilePath = Path.Combine(uploadDir, fileName);

            using (var stream = new FileStream(newFilePath, FileMode.Create))
            {
                await dto.PhotoFile.CopyToAsync(stream);
            }

            employee.Photo = $"/uploads/{fileName}";
        }

        // Map updated text/date values
        employee.Department_ID = dto.Department_ID;
        employee.Employee_First_name = dto.Employee_First_name;
        employee.Employee_Last_Name = dto.Employee_Last_Name;
        employee.Gender = dto.Gender;
        employee.Date_of_Birth = dto.Date_of_Birth;
        employee.Date_Joined = dto.Date_Joined;
        employee.Employee_Address = dto.Employee_Address;

        await _context.SaveChangesAsync();

        return NoContent(); // 204 No Content
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null) return NotFound();

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}