using Microsoft.EntityFrameworkCore;

namespace User.Models;

public class UserContext : DbContext
{
    public UserContext(DbContextOptions<UserContext> options)
        : base(options)
        {
            
        }
        public DbSet<User> User { get; set; } = null!;
}