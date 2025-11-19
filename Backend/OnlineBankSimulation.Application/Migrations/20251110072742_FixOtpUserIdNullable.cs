using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OnlineBankSimulation.Application.Migrations
{
    /// <inheritdoc />
    public partial class FixOtpUserIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update any existing records with invalid UserIds
            migrationBuilder.Sql(@"
                UPDATE OtpVerifications 
                SET UserId = NULL 
                WHERE UserId = 0 OR UserId NOT IN (SELECT Id FROM Users);
            ");

            // Drop the foreign key constraint
            migrationBuilder.DropForeignKey(
                name: "FK_OtpVerifications_Users_UserId",
                table: "OtpVerifications");

            // Alter the column to allow nulls
            migrationBuilder.AlterColumn<int?>(
                name: "UserId",
                table: "OtpVerifications",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            // Recreate the foreign key constraint
            migrationBuilder.AddForeignKey(
                name: "FK_OtpVerifications_Users_UserId",
                table: "OtpVerifications",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop the foreign key constraint
            migrationBuilder.DropForeignKey(
                name: "FK_OtpVerifications_Users_UserId",
                table: "OtpVerifications");

            // Alter the column back to not allow nulls
            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "OtpVerifications",
                type: "int",
                nullable: false,
                oldClrType: typeof(int?),
                oldType: "int",
                oldNullable: true);

            // Recreate the foreign key constraint
            migrationBuilder.AddForeignKey(
                name: "FK_OtpVerifications_Users_UserId",
                table: "OtpVerifications",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
