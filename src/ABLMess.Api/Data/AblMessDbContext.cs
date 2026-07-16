using ABLMess.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ABLMess.Api.Data;

public class AblMessDbContext(DbContextOptions<AblMessDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Jabatan> Jabatans => Set<Jabatan>();
    public DbSet<Ship> Ships => Set<Ship>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Bed> Beds => Set<Bed>();
    public DbSet<Request> Requests => Set<Request>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<HotelPlacement> HotelPlacements => Set<HotelPlacement>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Room>().Ignore(r => r.Status);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.EmployeeCode)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasOne(u => u.Ship)
            .WithMany()
            .HasForeignKey(u => u.ShipId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Jabatan)
            .WithMany()
            .HasForeignKey(u => u.JabatanId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Room>()
            .HasOne(r => r.Location)
            .WithMany(l => l.Rooms)
            .HasForeignKey(r => r.LocationId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Bed>()
            .HasOne(b => b.Room)
            .WithMany(r => r.Beds)
            .HasForeignKey(b => b.RoomId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Request>()
            .HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Request)
            .WithOne(r => r.Booking)
            .HasForeignKey<Booking>(b => b.RequestId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Bed)
            .WithMany(bed => bed.Bookings)
            .HasForeignKey(b => b.BedId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<HotelPlacement>()
            .HasOne(h => h.Request)
            .WithOne(r => r.HotelPlacement)
            .HasForeignKey<HotelPlacement>(h => h.RequestId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<HotelPlacement>()
            .HasOne(h => h.CreatedByUser)
            .WithMany()
            .HasForeignKey(h => h.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.Booking)
            .WithMany()
            .HasForeignKey(n => n.BookingId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.Request)
            .WithMany()
            .HasForeignKey(n => n.RequestId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AuditLog>()
            .HasOne(a => a.ActorUser)
            .WithMany()
            .HasForeignKey(a => a.ActorUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AuditLog>()
            .HasOne(a => a.SubjectUser)
            .WithMany()
            .HasForeignKey(a => a.SubjectUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
