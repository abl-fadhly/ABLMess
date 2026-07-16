using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ABLMess.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBedStatusAndLocationImage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Locations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Beds",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Beds");
        }
    }
}
