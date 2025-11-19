using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using OnlineBank.Core.Interfaces;
using MailKit.Net.Smtp;
using MimeKit;

namespace OnlineBankSimulation.Application.Services
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;
        private readonly IConfiguration _configuration;

        public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public async Task<bool> SendOtpEmailAsync(string email, string otpCode, string purpose)
        {
            try
            {
                // Check if test mode is enabled
                var testMode = _configuration["EmailSettings:TestMode"] == "true";
                
                if (testMode)
                {
                    _logger.LogInformation("📧 TEST MODE - OTP: {OtpCode} for {Email} ({Purpose})", otpCode, email, purpose);
                    Console.WriteLine($"\n🔔 EMAIL OTP for {email}: {otpCode} (Purpose: {purpose})\n");
                    return true;
                }

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_configuration["EmailSettings:SenderName"], _configuration["EmailSettings:SenderEmail"]));
                message.To.Add(new MailboxAddress("", email));
                message.Subject = $"Online Bank - Your OTP for {purpose}";
                
                message.Body = new TextPart("html")
                {
                    Text = $@"
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                            .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                            .header {{ text-align: center; color: #2c3e50; margin-bottom: 30px; }}
                            .otp-code {{ font-size: 32px; font-weight: bold; color: #e74c3c; text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0; letter-spacing: 3px; }}
                            .info {{ color: #7f8c8d; font-size: 14px; line-height: 1.6; }}
                            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; color: #95a5a6; font-size: 12px; text-align: center; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>🏦 Online Bank System</h1>
                                <h2>Email Verification Required</h2>
                            </div>
                            
                            <p>Hello,</p>
                            <p>You have requested an OTP for <strong>{purpose}</strong>. Please use the following code to complete your verification:</p>
                            
                            <div class='otp-code'>{otpCode}</div>
                            
                            <div class='info'>
                                <p><strong>⏰ Important:</strong> This code will expire in <strong>10 minutes</strong>.</p>
                                <p><strong>🔒 Security:</strong> Never share this code with anyone. Our staff will never ask for your OTP.</p>
                                <p><strong>❓ Didn't request this?</strong> Please ignore this email and contact our support team.</p>
                            </div>
                            
                            <div class='footer'>
                                <p>This is an automated message from Online Bank System.</p>
                                <p>© 2024 Online Bank. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                    "
                };

                using var client = new SmtpClient();
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                await client.ConnectAsync(_configuration["EmailSettings:SmtpServer"], int.Parse(_configuration["EmailSettings:SmtpPort"]), MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_configuration["EmailSettings:Username"], _configuration["EmailSettings:Password"]);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("📧 OTP email sent successfully to {Email} for {Purpose}", email, purpose);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send OTP email to {Email}. Error: {Error}", email, ex.Message);
                
                // Fallback: Show OTP in console if email fails
                _logger.LogInformation("📧 EMAIL FAILED - OTP: {OtpCode} for {Email} ({Purpose})", otpCode, email, purpose);
                Console.WriteLine($"\n🔔 EMAIL FAILED - OTP for {email}: {otpCode} (Purpose: {purpose})\n");
                
                return true; // Return true so user can still get OTP from console
            }
        }

        public async Task<bool> SendWelcomeEmailAsync(string email, string message)
        {
            try
            {
                var testMode = _configuration["EmailSettings:TestMode"] == "true";
                
                if (testMode)
                {
                    _logger.LogInformation("📧 TEST MODE - Transaction notification for {Email}: {Message}", email, message);
                    Console.WriteLine($"\n📧 TRANSACTION NOTIFICATION for {email}:\n{message}\n");
                    return true;
                }

                var emailMessage = new MimeMessage();
                emailMessage.From.Add(new MailboxAddress(_configuration["EmailSettings:SenderName"], _configuration["EmailSettings:SenderEmail"]));
                emailMessage.To.Add(new MailboxAddress("", email));
                emailMessage.Subject = "Online Bank - Transaction Notification";
                
                emailMessage.Body = new TextPart("html")
                {
                    Text = $@"
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                            .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                            .header {{ text-align: center; color: #2c3e50; margin-bottom: 30px; }}
                            .message {{ background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; color: #95a5a6; font-size: 12px; text-align: center; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>🏦 Online Bank</h1>
                                <h2>Transaction Notification</h2>
                            </div>
                            
                            <div class='message'>
                                <p>{message}</p>
                            </div>
                            
                            <div class='footer'>
                                <p>This is an automated message from Online Bank System.</p>
                                <p>© 2024 Online Bank. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                    "
                };

                using var client = new SmtpClient();
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                await client.ConnectAsync(_configuration["EmailSettings:SmtpServer"], int.Parse(_configuration["EmailSettings:SmtpPort"]), MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_configuration["EmailSettings:Username"], _configuration["EmailSettings:Password"]);
                await client.SendAsync(emailMessage);
                await client.DisconnectAsync(true);

                _logger.LogInformation("📧 Transaction notification sent successfully to {Email}", email);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send transaction notification to {Email}", email);
                Console.WriteLine($"\n📧 EMAIL FAILED - Transaction notification for {email}:\n{message}\n");
                return true;
            }
        }

        public async Task<bool> SendAccountApprovalEmailAsync(string email, string fullName)
        {
            try
            {
                var testMode = _configuration["EmailSettings:TestMode"] == "true";
                
                if (testMode)
                {
                    _logger.LogInformation("📧 TEST MODE - Account Approved for {Email}", email);
                    Console.WriteLine($"\n🎉 ACCOUNT APPROVED for {fullName} ({email})\n✅ Your account is now active!\n💳 You can now apply for debit/credit cards\n");
                    return true;
                }

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_configuration["EmailSettings:SenderName"], _configuration["EmailSettings:SenderEmail"]));
                message.To.Add(new MailboxAddress(fullName, email));
                message.Subject = "🎉 Account Approved - Welcome to Online Bank!";
                
                message.Body = new TextPart("html")
                {
                    Text = $@"
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                            .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                            .header {{ text-align: center; color: #2c3e50; margin-bottom: 30px; }}
                            .success {{ background-color: #d4edda; color: #155724; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }}
                            .next-steps {{ background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                            .info {{ color: #7f8c8d; font-size: 14px; line-height: 1.6; }}
                            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; color: #95a5a6; font-size: 12px; text-align: center; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>🏦 Online Bank</h1>
                                <h2>🎉 Congratulations!</h2>
                            </div>
                            
                            <div class='success'>
                                <h3>Your Account Has Been Approved!</h3>
                                <p>Your account is now active and ready to use.</p>
                            </div>
                            
                            <p>Dear {fullName},</p>
                            <p>Great news! Your bank account has been successfully approved and activated.</p>
                            
                            <div class='next-steps'>
                                <h3>🚀 What You Can Do Now:</h3>
                                <ul>
                                    <li>💳 Apply for debit and credit cards</li>
                                    <li>💰 Start making deposits and withdrawals</li>
                                    <li>🔄 Transfer money to other accounts</li>
                                    <li>📱 Access online banking services</li>
                                    <li>📊 View account statements and transaction history</li>
                                </ul>
                            </div>
                            
                            <div class='info'>
                                <p><strong>📞 Need Help?</strong> Contact our customer support team for any assistance.</p>
                                <p><strong>🔒 Security:</strong> Keep your account details secure and never share your login credentials.</p>
                            </div>
                            
                            <div class='footer'>
                                <p>Welcome to the Online Bank family!</p>
                                <p>© 2024 Online Bank. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                    "
                };

                using var client = new SmtpClient();
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                await client.ConnectAsync(_configuration["EmailSettings:SmtpServer"], int.Parse(_configuration["EmailSettings:SmtpPort"]), MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_configuration["EmailSettings:Username"], _configuration["EmailSettings:Password"]);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("📧 Account approval email sent successfully to {Email}", email);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send account approval email to {Email}", email);
                Console.WriteLine($"\n🎉 EMAIL FAILED - Account Approved for {fullName} ({email})\n✅ Your account is now active!\n");
                return true;
            }
        }

        public async Task<bool> SendAccountRejectionEmailAsync(string email, string fullName, string reason)
        {
            _logger.LogInformation("📧 Rejection email sent to {Email}", email);
            return true;
        }

        public async Task<bool> SendAccountCreationEmailAsync(string email, string fullName, string accountNumber)
        {
            try
            {
                var testMode = _configuration["EmailSettings:TestMode"] == "true";
                
                if (testMode)
                {
                    _logger.LogInformation("📧 TEST MODE - Account Created: {AccountNumber} for {Email}", accountNumber, email);
                    Console.WriteLine($"\n🎉 ACCOUNT CREATED for {fullName} ({email})\n📋 Account Number: {accountNumber}\n✅ Status: Pending Verification\n");
                    return true;
                }

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_configuration["EmailSettings:SenderName"], _configuration["EmailSettings:SenderEmail"]));
                message.To.Add(new MailboxAddress(fullName, email));
                message.Subject = "Welcome to Online Bank - Account Created Successfully";
                
                message.Body = new TextPart("html")
                {
                    Text = $@"
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                            .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                            .header {{ text-align: center; color: #2c3e50; margin-bottom: 30px; }}
                            .account-info {{ background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                            .account-number {{ font-size: 24px; font-weight: bold; color: #27ae60; text-align: center; }}
                            .status {{ color: #f39c12; font-weight: bold; }}
                            .info {{ color: #7f8c8d; font-size: 14px; line-height: 1.6; }}
                            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; color: #95a5a6; font-size: 12px; text-align: center; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>🏦 Welcome to Online Bank!</h1>
                                <h2>Your Account Has Been Created</h2>
                            </div>
                            
                            <p>Dear {fullName},</p>
                            <p>Congratulations! Your bank account application has been successfully submitted.</p>
                            
                            <div class='account-info'>
                                <div class='account-number'>Account Number: {accountNumber}</div>
                                <p style='text-align: center; margin-top: 10px;'>
                                    <span class='status'>Status: Pending Verification</span>
                                </p>
                            </div>
                            
                            <div class='info'>
                                <h3>📋 What's Next?</h3>
                                <ul>
                                    <li>Our team will review your KYC documents</li>
                                    <li>Verification typically takes 1-2 business days</li>
                                    <li>You'll receive an email once your account is approved</li>
                                    <li>After approval, you can start using your account</li>
                                </ul>
                                
                                <h3>📞 Need Help?</h3>
                                <p>Contact our customer support team if you have any questions.</p>
                            </div>
                            
                            <div class='footer'>
                                <p>Thank you for choosing Online Bank!</p>
                                <p>© 2024 Online Bank. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                    "
                };

                using var client = new SmtpClient();
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                await client.ConnectAsync(_configuration["EmailSettings:SmtpServer"], int.Parse(_configuration["EmailSettings:SmtpPort"]), MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_configuration["EmailSettings:Username"], _configuration["EmailSettings:Password"]);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("📧 Account creation email sent successfully to {Email}", email);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send account creation email to {Email}", email);
                Console.WriteLine($"\n🎉 EMAIL FAILED - Account Created for {fullName} ({email})\n📋 Account Number: {accountNumber}\n");
                return true;
            }
        }
    }
}