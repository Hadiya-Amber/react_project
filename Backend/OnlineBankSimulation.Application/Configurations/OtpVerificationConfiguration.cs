using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnlineBank.Core.Models;

namespace OnlineBankSimulation.Application.Configurations
{
    public class OtpVerificationConfiguration : IEntityTypeConfiguration<OtpVerification>
    {
        public void Configure(EntityTypeBuilder<OtpVerification> builder)
        {
            builder.ToTable("OtpVerifications");

            // Primary Key
            builder.HasKey(o => o.Id);

            // Foreign Key Relationship (Optional for registration OTPs)
            builder.HasOne(o => o.User)
                   .WithMany(u => u.OtpVerifications)
                   .HasForeignKey(o => o.UserId)
                   .OnDelete(DeleteBehavior.Cascade)
                   .IsRequired(false);

            // Properties
            builder.Property(o => o.Email)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(o => o.OtpCode)
                   .IsRequired()
                   .HasMaxLength(6);

            builder.Property(o => o.Purpose)
                   .IsRequired();

            builder.Property(o => o.ExpiresAt)
                   .IsRequired();

            builder.Property(o => o.IsUsed)
                   .HasDefaultValue(false);

            builder.Property(o => o.AttemptCount)
                   .HasDefaultValue(0);

            // Indexes for performance
            builder.HasIndex(o => new { o.UserId, o.Purpose, o.IsUsed })
                   .HasDatabaseName("IX_OtpVerifications_User_Purpose_Used");

            builder.HasIndex(o => o.ExpiresAt)
                   .HasDatabaseName("IX_OtpVerifications_ExpiresAt");

            builder.HasIndex(o => new { o.Email, o.OtpCode })
                   .HasDatabaseName("IX_OtpVerifications_Email_Code");
        }
    }
}