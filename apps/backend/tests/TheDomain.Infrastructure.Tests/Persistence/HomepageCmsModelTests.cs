using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using TheDomain.Domain.Homepage;
using TheDomain.Infrastructure.Persistence;

namespace TheDomain.Infrastructure.Tests.Persistence;

public sealed class HomepageCmsModelTests
{
    [Fact]
    public void PartnerSlugHasUniqueDatabaseIndex()
    {
        using var context = CreateContext();
        var entity = context.Model.FindEntityType(typeof(Partner));

        var index = Assert.Single(entity!.GetIndexes(), candidate =>
            candidate.Properties.Select(property => property.Name).SequenceEqual([nameof(Partner.Slug)]));

        Assert.True(index.IsUnique);
    }

    [Fact]
    public void HomepageContentUsesApplicationAssignedSingletonKey()
    {
        using var context = CreateContext();
        var entity = context.GetService<IDesignTimeModel>().Model.FindEntityType(typeof(HomepageContent));
        var id = entity!.FindProperty(nameof(HomepageContent.Id));
        var constraint = Assert.Single(entity.GetCheckConstraints(), candidate =>
            candidate.Name == "ck_homepage_content_singleton");

        Assert.Equal(Microsoft.EntityFrameworkCore.Metadata.ValueGenerated.Never, id!.ValueGenerated);
        Assert.Equal($"\"Id\" = '{HomepageContent.SingletonId}'", constraint.Sql);
    }

    [Fact]
    public void HomepageCompositionIsNotDatabaseOwned()
    {
        using var context = CreateContext();
        var entity = context.GetService<IDesignTimeModel>().Model.FindEntityType(typeof(HomepageContent));

        Assert.Null(entity!.FindProperty("SectionOrder"));
        Assert.Null(entity.FindProperty("DisabledSections"));
        Assert.DoesNotContain(typeof(HomepageContent).GetProperties(), property =>
            property.Name is "SectionOrder" or "DisabledSections");
    }

    private static TheDomainDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<TheDomainDbContext>()
            .UseNpgsql("Host=localhost;Database=model_only;Username=test;Password=test")
            .Options;
        return new TheDomainDbContext(options);
    }
}
