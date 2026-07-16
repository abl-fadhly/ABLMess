using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ABLMess.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserEmployeeCodeAndPhoto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EmployeeCode",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PhotoUrl",
                table: "Users",
                type: "text",
                nullable: true);

            // Backfill unique employee codes for any pre-existing rows before the unique index is created.
            // UserType is stored as its enum ordinal: Admin=0, GS=1, Crew=2.
            migrationBuilder.Sql(@"
                UPDATE ""Users"" u
                SET ""EmployeeCode"" = sub.""Code""
                FROM (
                    SELECT ""Id"",
                        CASE ""UserType""
                            WHEN 0 THEN 'ADM-' || (9000 + ROW_NUMBER() OVER (PARTITION BY ""UserType"" ORDER BY ""Id""))
                            WHEN 1 THEN 'GS-' || (2000 + ROW_NUMBER() OVER (PARTITION BY ""UserType"" ORDER BY ""Id""))
                            WHEN 2 THEN 'CRW-' || (1000 + ROW_NUMBER() OVER (PARTITION BY ""UserType"" ORDER BY ""Id""))
                        END AS ""Code""
                    FROM ""Users""
                ) sub
                WHERE u.""Id"" = sub.""Id"";
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Users_EmployeeCode",
                table: "Users",
                column: "EmployeeCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_EmployeeCode",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "EmployeeCode",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PhotoUrl",
                table: "Users");
        }
    }
}
