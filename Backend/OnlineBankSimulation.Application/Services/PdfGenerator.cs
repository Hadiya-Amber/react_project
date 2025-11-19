using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using OnlineBank.Core.Interfaces;
using OnlineBank.Core.Models;
using Microsoft.Extensions.Logging;

namespace OnlineBank.Core.Services
{
    public class PdfGenerator : IPdfGenerator
    {
        private readonly ILogger<PdfGenerator> _logger;

        public PdfGenerator(ILogger<PdfGenerator> logger)
        {
            _logger = logger;
        }

        public async Task<string?> GenerateTransactionPdfAsync(string customerName, string accountNumber, string transactionType, decimal amount)
        {
            await Task.Delay(100);
            return "mock-pdf-path.pdf";
        }

        public async Task<byte[]> GenerateTransactionStatementAsync(IEnumerable<Transaction> transactions, string accountNumber, int accountId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                QuestPDF.Settings.License = LicenseType.Community;
                
                var transactionList = transactions.OrderByDescending(t => t.TransactionDate).ToList();
                var completedTransactions = transactionList.Where(t => t.Status == OnlineBank.Core.Enums.TransactionStatus.Completed).ToList();
                
                var document = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(2, Unit.Centimetre);
                        
                        page.Header().Text("ONLINE BANK - ACCOUNT STATEMENT")
                            .FontSize(16).Bold().FontColor(Colors.Blue.Darken2).AlignCenter();
                            
                        page.Content().Column(column =>
                        {
                            column.Spacing(8);
                            
                            column.Item().Text($"Account Number: {accountNumber}").FontSize(12).Bold().FontColor(Colors.Grey.Darken2);
                            var periodStart = fromDate?.ToString("dd/MM/yyyy") ?? transactionList.LastOrDefault()?.TransactionDate.ToString("dd/MM/yyyy") ?? DateTime.Now.AddMonths(-1).ToString("dd/MM/yyyy");
                            var periodEnd = toDate?.ToString("dd/MM/yyyy") ?? transactionList.FirstOrDefault()?.TransactionDate.ToString("dd/MM/yyyy") ?? DateTime.Now.ToString("dd/MM/yyyy");
                            column.Item().Text($"Statement Period: {periodStart} to {periodEnd}").FontSize(11).FontColor(Colors.Grey.Darken1);
                            column.Item().Text($"Generated: {DateTime.UtcNow:dd/MM/yyyy HH:mm}").FontSize(10).FontColor(Colors.Grey.Darken1);
                            
                            // Determine totals
                            decimal totalCredits = 0m;
                            decimal totalDebits = 0m;
                            
                            if (accountId == 0) // Admin view - all accounts
                            {
                                // For admin, show total transaction volume
                                totalCredits = completedTransactions.Where(t => t.TransactionType == OnlineBank.Core.Enums.TransactionType.Deposit || t.TransactionType == OnlineBank.Core.Enums.TransactionType.Transfer).Sum(t => t.Amount);
                                totalDebits = completedTransactions.Where(t => t.TransactionType == OnlineBank.Core.Enums.TransactionType.Withdrawal).Sum(t => t.Amount);
                            }
                            else // User-specific account view
                            {
                                foreach (var t in completedTransactions)
                                {
                                    var isCredit = t.ToAccountId.HasValue && t.ToAccountId.Value == accountId;
                                    var isDebit = t.FromAccountId.HasValue && t.FromAccountId.Value == accountId;

                                    if (isCredit && !isDebit)
                                    {
                                        totalCredits += t.Amount;
                                    }
                                    else if (isDebit && !isCredit)
                                    {
                                        totalDebits += t.Amount;
                                    }
                                    else if (isCredit && isDebit)
                                    {
                                        totalCredits += t.Amount;
                                    }
                                }
                            }
                            
                            column.Item().Text($"Total Transactions: {transactionList.Count()}").FontSize(11).FontColor(Colors.Blue.Darken1);
                            column.Item().Text($"Total Credits: ₹{totalCredits:N2}").FontSize(11).FontColor(Colors.Green.Darken2);
                            column.Item().Text($"Total Debits: ₹{totalDebits:N2}").FontSize(11).FontColor(Colors.Red.Darken2);
                            
                            if (transactionList.Any())
                            {
                                column.Item().PaddingTop(10).Text("TRANSACTION HISTORY").FontSize(12).Bold().FontColor(Colors.Blue.Darken2);
                                
                                foreach (var transaction in transactionList.Take(20))
                                {
                                    column.Item().PaddingTop(5).Column(txnCol =>
                                    {
                                        txnCol.Item().Text($"{transaction.TransactionDate:dd/MM/yyyy} - {transaction.TransactionType}").FontSize(10).Bold();
                                        txnCol.Item().Text($"Amount: ₹{transaction.Amount:N2} | Status: {transaction.Status}").FontSize(9).FontColor(GetStatusColor(transaction.Status));
                                        if (!string.IsNullOrEmpty(transaction.Description))
                                        {
                                            txnCol.Item().Text($"Description: {transaction.Description}").FontSize(9).FontColor(Colors.Grey.Darken1);
                                        }
                                    });
                                }
                                
                                if (transactionList.Count > 20)
                                {
                                    column.Item().PaddingTop(5).Text($"... and {transactionList.Count - 20} more transactions").FontSize(9).FontColor(Colors.Grey.Darken1);
                                }
                            }
                            else
                            {
                                column.Item().PaddingTop(10).Text("No transactions found for this period.").FontSize(11).FontColor(Colors.Grey.Darken1);
                            }
                        });
                        
                        page.Footer().Text($"Generated: {DateTime.Now:dd/MM/yyyy HH:mm} | Online Bank Simulation")
                            .FontSize(9).FontColor(Colors.Grey.Darken1).AlignCenter();
                    });
                });
                
                _logger.LogInformation("PDF statement generated for account {AccountId} with {Count} transactions", accountId, transactionList.Count);
                return document.GeneratePdf();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating PDF statement for account {AccountId}", accountId);
                return Array.Empty<byte>();
            }
        }

        public async Task<byte[]> GenerateTransactionReceiptAsync(Transaction transaction, Account? fromAccount, Account? toAccount, User? fromUser, User? toUser)
        {
            try
            {
                QuestPDF.Settings.License = LicenseType.Community;
                
                var document = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(1.5f, Unit.Centimetre);
                        page.DefaultTextStyle(x => x.FontSize(11));

                        // Professional Bank Header
                        page.Header().Height(100).Background(Colors.Blue.Darken2).Padding(20).Column(header =>
                        {
                            header.Item().Row(row =>
                            {
                                row.RelativeItem().Column(col =>
                                {
                                    col.Item().Text("BankEase").FontSize(28).Bold().FontColor(Colors.White);
                                    col.Item().Text("Your Trusted Banking Partner").FontSize(12).FontColor(Colors.Blue.Lighten3);
                                });
                                row.ConstantItem(150).AlignRight().Column(col =>
                                {
                                    col.Item().Text("TRANSACTION RECEIPT").FontSize(14).Bold().FontColor(Colors.White);
                                    col.Item().Text($"Receipt #{transaction.Id:D6}").FontSize(11).FontColor(Colors.Blue.Lighten3);
                                });
                            });
                        });

                        page.Content().PaddingVertical(20).Column(column =>
                        {
                            column.Spacing(15);
                            
                            // Status Banner
                            var statusColor = transaction.Status.ToString() == "Completed" ? Colors.Green.Medium : 
                                             transaction.Status.ToString() == "Pending" ? Colors.Orange.Medium : Colors.Red.Medium;
                            var statusText = transaction.Status.ToString() == "Completed" ? "✓ TRANSACTION SUCCESSFUL" :
                                            transaction.Status.ToString() == "Pending" ? "⏳ TRANSACTION PENDING" : "✗ TRANSACTION FAILED";
                            
                            column.Item().Background(statusColor).Padding(15).Row(row =>
                            {
                                row.RelativeItem().Text(statusText).FontSize(16).Bold().FontColor(Colors.White);
                                row.ConstantItem(120).AlignRight().Text($"₹{transaction.Amount:N2}").FontSize(18).Bold().FontColor(Colors.White);
                            });
                            
                            // Transaction Details
                            column.Item().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(15).Column(details =>
                            {
                                details.Item().Text("TRANSACTION DETAILS").FontSize(14).Bold().FontColor(Colors.Blue.Darken2);
                                details.Item().PaddingTop(5).LineHorizontal(1).LineColor(Colors.Blue.Lighten1);
                                details.Item().PaddingTop(10);
                                
                                details.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn(2f);
                                        columns.RelativeColumn(3f);
                                    });

                                    table.Cell().Padding(6).Text("Reference ID:").FontSize(11).Bold().FontColor(Colors.Grey.Darken2);
                                    table.Cell().Padding(6).Text(transaction.TransactionReference ?? $"TXN{transaction.Id:D8}").FontSize(11).FontColor(Colors.Blue.Darken1);

                                    table.Cell().Padding(6).Background(Colors.Grey.Lighten5).Text("Transaction Type:").FontSize(11).Bold().FontColor(Colors.Grey.Darken2);
                                    table.Cell().Padding(6).Background(Colors.Grey.Lighten5).Text(transaction.TransactionType.ToString()).FontSize(11).FontColor(Colors.Green.Darken2);

                                    table.Cell().Padding(6).Text("Date & Time:").FontSize(11).Bold().FontColor(Colors.Grey.Darken2);
                                    table.Cell().Padding(6).Text(transaction.TransactionDate.ToString("dd MMM yyyy, hh:mm tt")).FontSize(11);

                                    table.Cell().Padding(6).Background(Colors.Grey.Lighten5).Text("Amount:").FontSize(11).Bold().FontColor(Colors.Grey.Darken2);
                                    table.Cell().Padding(6).Background(Colors.Grey.Lighten5).Text($"₹{transaction.Amount:N2}").FontSize(14).Bold().FontColor(Colors.Green.Darken1);

                                    if (fromAccount != null && fromUser != null)
                                    {
                                        table.Cell().Padding(6).Text("From Account:").FontSize(11).Bold().FontColor(Colors.Grey.Darken2);
                                        table.Cell().Padding(6).Text($"{fromUser.FullName} - {fromAccount.AccountNumber}").FontSize(11);
                                    }

                                    if (toAccount != null && toUser != null)
                                    {
                                        table.Cell().Padding(6).Background(Colors.Grey.Lighten5).Text("To Account:").FontSize(11).Bold().FontColor(Colors.Grey.Darken2);
                                        table.Cell().Padding(6).Background(Colors.Grey.Lighten5).Text($"{toUser.FullName} - {toAccount.AccountNumber}").FontSize(11);
                                    }

                                    if (!string.IsNullOrEmpty(transaction.Description))
                                    {
                                        table.Cell().Padding(6).Text("Description:").FontSize(11).Bold().FontColor(Colors.Grey.Darken2);
                                        table.Cell().Padding(6).Text(transaction.Description).FontSize(11);
                                    }

                                    if (transaction.BalanceAfterTransaction > 0)
                                    {
                                        table.Cell().Padding(6).Background(Colors.Grey.Lighten5).Text("Available Balance:").FontSize(11).Bold().FontColor(Colors.Grey.Darken2);
                                        table.Cell().Padding(6).Background(Colors.Grey.Lighten5).Text($"₹{transaction.BalanceAfterTransaction:N2}").FontSize(12).Bold().FontColor(Colors.Blue.Darken2);
                                    }
                                });
                            });
                            
                            // Compact Important Information
                            column.Item().Background(Colors.Blue.Lighten5).Padding(10).Column(info =>
                            {
                                info.Item().Text("IMPORTANT INFORMATION").FontSize(12).Bold().FontColor(Colors.Blue.Darken2);
                                info.Item().PaddingTop(5).Text("• This receipt serves as proof of your transaction").FontSize(10).FontColor(Colors.Grey.Darken1);
                                info.Item().Text("• For queries, contact 24/7 customer care: 1800-BANKEASE (1800-226-5327)").FontSize(10).FontColor(Colors.Grey.Darken1);
                            });
                        });

                        // Compact Footer
                        page.Footer().Height(35).Background(Colors.Blue.Darken2).Padding(8).Row(row =>
                        {
                            row.RelativeItem().Text($"Generated: {DateTime.Now:dd MMM yyyy, hh:mm tt} | Computer-generated receipt").FontSize(9).FontColor(Colors.Blue.Lighten3);
                            row.ConstantItem(180).AlignRight().Text("Thank you for banking with BankEase!").FontSize(10).Bold().FontColor(Colors.White);
                        });
                    });
                });
                
                await Task.CompletedTask;
                return document.GeneratePdf();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating PDF receipt for transaction {TransactionId}", transaction.Id);
                return Array.Empty<byte>();
            }
        }
        
        private static string GetStatusText(OnlineBank.Core.Enums.TransactionStatus status)
        {
            return status switch
            {
                OnlineBank.Core.Enums.TransactionStatus.Completed => "✓ COMPLETED",
                OnlineBank.Core.Enums.TransactionStatus.Pending => "⏳ PENDING",
                OnlineBank.Core.Enums.TransactionStatus.Processing => "⚡ PROCESSING",
                OnlineBank.Core.Enums.TransactionStatus.Failed => "✗ FAILED",
                _ => status.ToString().ToUpper()
            };
        }
        
        private static string GetStatusColor(OnlineBank.Core.Enums.TransactionStatus status)
        {
            return status switch
            {
                OnlineBank.Core.Enums.TransactionStatus.Completed => Colors.Green.Darken2,
                OnlineBank.Core.Enums.TransactionStatus.Pending => Colors.Orange.Darken2,
                OnlineBank.Core.Enums.TransactionStatus.Processing => Colors.Blue.Darken2,
                OnlineBank.Core.Enums.TransactionStatus.Failed => Colors.Red.Darken2,
                _ => Colors.Grey.Darken2
            };
        }
        
        private static string GetStatusBgColor(OnlineBank.Core.Enums.TransactionStatus status)
        {
            return status switch
            {
                OnlineBank.Core.Enums.TransactionStatus.Completed => Colors.Green.Darken1,
                OnlineBank.Core.Enums.TransactionStatus.Pending => Colors.Orange.Darken1,
                OnlineBank.Core.Enums.TransactionStatus.Processing => Colors.Blue.Darken1,
                OnlineBank.Core.Enums.TransactionStatus.Failed => Colors.Red.Darken1,
                _ => Colors.Grey.Darken1
            };
        }
    }
}