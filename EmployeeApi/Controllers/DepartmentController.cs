using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EmployeeApi.Data;
using EmployeeApi.Models;
using EmployeeApi.DTOs;

namespace EmployeeApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepartmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public DepartmentsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/departments
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Department>>> GetDepartments()
    {
        return await _context.Departments
            .AsNoTracking()
            .ToListAsync();
    }

    // GET: api/departments/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Department>> GetDepartment(int id)
    {
        var department = await _context.Departments
            .Include(d => d.Employees) // Includes related employees
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Department_ID == id);

        if (department == null)
        {
            return NotFound(new { message = $"Department with ID {id} not found." });
        }

        return department;
    }

    // POST: api/departments
    [HttpPost]
    public async Task<ActionResult<Department>> CreateDepartment([FromBody] DepartmentCreateDto dto)
    {
        var department = new Department
        {
            Department_Name = dto.Department_Name,
            Department_Address = dto.Department_Address
        };

        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetDepartment), new { id = department.Department_ID }, department);
    }

    // PUT: api/departments/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDepartment(int id, [FromBody] Department department)
    {
        if (id != department.Department_ID)
        {
            return BadRequest(new { message = "ID in route does not match ID in payload." });
        }

        var existing = await _context.Departments.FindAsync(id);
        if (existing == null)
        {
            return NotFound(new { message = $"Department with ID {id} not found." });
        }

        existing.Department_Name = department.Department_Name;
        existing.Department_Address = department.Department_Address;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/departments/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDepartment(int id)
    {
        var department = await _context.Departments.FindAsync(id);
        if (department == null)
        {
            return NotFound(new { message = $"Department with ID {id} not found." });
        }

        _context.Departments.Remove(department);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}