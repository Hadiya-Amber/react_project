using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnlineBank.Core.Models;

namespace OnlineBank.Infrastructure.Configurations
{
    public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
    {
        public void Configure(EntityTypeBuilder<Transaction> builder)
        {
            builder.HasKey(t => t.Id);

            builder.Property(t => t.Amount)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(t => t.TransactionDate)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(t => t.Description)
                .HasMaxLength(500);

            // Relationships
            builder.HasOne(t => t.FromAccount)
                .WithMany(a => a.OutgoingTransactions)
                .HasForeignKey(t => t.FromAccountId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(t => t.ToAccount)
                .WithMany(a => a.IncomingTransactions)
                .HasForeignKey(t => t.ToAccountId)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexes for optimization
            builder.HasIndex(t => t.FromAccountId);
            builder.HasIndex(t => t.ToAccountId);
            builder.HasIndex(t => t.TransactionDate);
            builder.HasIndex(t => t.TransactionType);
        }
    }
}
