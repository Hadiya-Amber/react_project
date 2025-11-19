using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnlineBank.Core.Enums;
using OnlineBank.Core.Models;

namespace OnlineBank.Infrastructure.Configurations
{
    public class BranchConfiguration : IEntityTypeConfiguration<Branch>
    {
        public void Configure(EntityTypeBuilder<Branch> builder)
        {
            builder.HasKey(br => br.Id);

            builder.Property(br => br.BranchCode)
                .IsRequired()
                .HasMaxLength(10);

            builder.Property(br => br.IFSCCode)
                .IsRequired()
                .HasMaxLength(11);

            // Single bank system - no Bank relationship needed

            builder.HasMany(br => br.Accounts)
                .WithOne(a => a.Branch)
                .HasForeignKey(a => a.BranchId)
                .OnDelete(DeleteBehavior.Restrict);

            // Seed Data - Single Bank Multiple Branches
            builder.HasData(
                new Branch
                {
                    Id = 1,
                    BranchCode = "OBS001",
                    BranchName = "Main Branch",
                    Address = "123 Banking Street, Financial District",
                    City = "Mumbai",
                    State = "Maharashtra",
                    IFSCCode = "OBSN0000001",
                    ManagerName = "Rajesh Kumar",
                    PhoneNumber = "+912222661234",
                    BranchType = BranchType.Main,
                    IsActive = true,
                    CreatedAt = new DateTime(2025, 1, 1),
                    CreatedBy = "System",
                    IsDeleted = false
                },
                new Branch
                {
                    Id = 2,
                    BranchCode = "OBS002",
                    BranchName = "Delhi Branch",
                    Address = "Connaught Place, New Delhi",
                    City = "New Delhi",
                    State = "Delhi",
                    IFSCCode = "OBSN0000002",
                    ManagerName = "Priya Sharma",
                    PhoneNumber = "+911123456789",
                    BranchType = BranchType.Regional,
                    IsActive = true,
                    CreatedAt = new DateTime(2025, 1, 1),
                    CreatedBy = "System",
                    IsDeleted = false
                },
                new Branch
                {
                    Id = 3,
                    BranchCode = "OBS003",
                    BranchName = "Bangalore Branch",
                    Address = "Koramangala, Bangalore",
                    City = "Bangalore",
                    State = "Karnataka",
                    IFSCCode = "OBSN0000003",
                    ManagerName = "Sunita Reddy",
                    PhoneNumber = "+918012345678",
                    BranchType = BranchType.Sub,
                    IsActive = true,
                    CreatedAt = new DateTime(2025, 1, 1),
                    CreatedBy = "System",
                    IsDeleted = false
                }
            );
        }
    }
}