using System.Reflection;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using TheDomain.Infrastructure.Persistence.Migrations;

namespace TheDomain.Infrastructure.Tests.Persistence;

public sealed class EventBookingStatusMigrationTests
{
    [Fact]
    public void UpBackfillsBeforeDroppingLegacyBoolean()
    {
        var operations = Operations("Up");

        var add = Assert.IsType<AddColumnOperation>(operations[0]);
        Assert.Equal("BookingStatus", add.Name);
        Assert.True(add.IsNullable);
        var backfill = Assert.IsType<SqlOperation>(operations[1]);
        Assert.Contains("WHEN \"IsBookingEnabled\" THEN 3 ELSE 1", backfill.Sql,
            StringComparison.Ordinal);
        var alter = Assert.IsType<AlterColumnOperation>(operations[2]);
        Assert.False(alter.IsNullable);
        Assert.IsType<AddCheckConstraintOperation>(operations[3]);
        var drop = Assert.IsType<DropColumnOperation>(operations[4]);
        Assert.Equal("IsBookingEnabled", drop.Name);
    }

    [Fact]
    public void DownMapsOnlyOpenStatusToEnabledBeforeDroppingStatus()
    {
        var operations = Operations("Down");

        Assert.IsType<DropCheckConstraintOperation>(operations[0]);
        var add = Assert.IsType<AddColumnOperation>(operations[1]);
        Assert.Equal("IsBookingEnabled", add.Name);
        var backfill = Assert.IsType<SqlOperation>(operations[2]);
        Assert.Contains("WHEN \"BookingStatus\" = 3 THEN TRUE ELSE FALSE", backfill.Sql,
            StringComparison.Ordinal);
        var drop = Assert.IsType<DropColumnOperation>(operations[3]);
        Assert.Equal("BookingStatus", drop.Name);
    }

    private static List<MigrationOperation> Operations(string methodName)
    {
        var migration = new AddEventBookingStatus();
        var builder = new MigrationBuilder("Npgsql.EntityFrameworkCore.PostgreSQL");
        typeof(AddEventBookingStatus)
            .GetMethod(methodName, BindingFlags.Instance | BindingFlags.NonPublic)!
            .Invoke(migration, [builder]);
        return builder.Operations;
    }
}
