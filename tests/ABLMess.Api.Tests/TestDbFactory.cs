using ABLMess.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace ABLMess.Api.Tests;

public static class TestDbFactory
{
    public static AblMessDbContext Create()
    {
        var options = new DbContextOptionsBuilder<AblMessDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AblMessDbContext(options);
    }
}
