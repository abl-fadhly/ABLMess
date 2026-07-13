using ABLMess.Api.Data;
using ABLMess.Api.Dtos;
using ABLMess.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ABLMess.Api.Controllers;

[ApiController]
[Route("api/jabatans")]
[Authorize(Roles = "Admin,GS")]
public class JabatansController(AblMessDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<JabatanDto>>> GetAll()
    {
        var jabatans = await db.Jabatans.ToListAsync();
        return Ok(jabatans.Select(j => new JabatanDto(j.Id, j.NamaJabatan)));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<JabatanDto>> GetById(int id)
    {
        var jabatan = await db.Jabatans.FindAsync(id);
        return jabatan is null ? NotFound() : Ok(new JabatanDto(jabatan.Id, jabatan.NamaJabatan));
    }

    [HttpPost]
    public async Task<ActionResult<JabatanDto>> Create(CreateJabatanDto dto)
    {
        var jabatan = new Jabatan { NamaJabatan = dto.NamaJabatan };
        db.Jabatans.Add(jabatan);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = jabatan.Id }, new JabatanDto(jabatan.Id, jabatan.NamaJabatan));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<JabatanDto>> Update(int id, CreateJabatanDto dto)
    {
        var jabatan = await db.Jabatans.FindAsync(id);
        if (jabatan is null)
        {
            return NotFound();
        }

        jabatan.NamaJabatan = dto.NamaJabatan;
        await db.SaveChangesAsync();
        return Ok(new JabatanDto(jabatan.Id, jabatan.NamaJabatan));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var jabatan = await db.Jabatans.FindAsync(id);
        if (jabatan is null)
        {
            return NotFound();
        }

        db.Jabatans.Remove(jabatan);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
