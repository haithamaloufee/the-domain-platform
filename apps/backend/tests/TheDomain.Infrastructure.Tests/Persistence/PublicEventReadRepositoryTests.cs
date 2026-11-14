using Microsoft.EntityFrameworkCore;
using TheDomain.Application.Events.Contracts;
using TheDomain.Domain.Events;
using TheDomain.Domain.Media;
using TheDomain.Infrastructure.Persistence;

namespace TheDomain.Infrastructure.Tests.Persistence;

public sealed class PublicEventReadRepositoryTests
{
    private static readonly DateTimeOffset Now = new(2026, 8, 1, 12, 0, 0, TimeSpan.Zero);

    [Fact]
    public async Task PublicQueriesFilterLimitAndProjectWithoutTrackingEntities()
    {
        var databaseName = Guid.NewGuid().ToString();
        await using var context = CreateInMemoryContext(databaseName);
        var featured = Published("featured", Now.AddHours(1), Now.AddHours(3), true, true);
        var current = Published("current", Now.AddHours(2), Now.AddHours(4), false, true);
        var hidden = Published("hidden", Now.AddMinutes(30), Now.AddHours(2), true, false);
        var previous = Published("previous", Now.AddDays(-2), Now.AddDays(-1), false, true);
        AttachMedia(featured, EventMediaUsage.Cover, MediaType.Image, true, 0);
        AttachMedia(featured, EventMediaUsage.Gallery, MediaType.Video, true, 1);
        AttachMedia(current, EventMediaUsage.Cover, MediaType.Image, true, 0);
        AttachMedia(previous, EventMediaUsage.Cover, MediaType.Image, true, 0);
        context.Events.AddRange(featured, current, hidden, previous);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        var repository = new EventRepository(context);
        var upcoming = await repository.ListPublicAsync(PublicEventQueryKind.Upcoming, Now, 1,
            CancellationToken.None);
        var homepage = await repository.GetHomepagePreviewAsync(Now, 2, 2, 3,
            CancellationToken.None);

        Assert.Single(upcoming);
        Assert.Equal("hidden", upcoming[0].Slug);
        Assert.Equal(["featured", "current"], homepage.CurrentEvents.Select(item => item.Slug));
        Assert.Equal("previous", Assert.Single(homepage.PreviousEvents).Slug);
        var album = Assert.Single(homepage.GalleryAlbums);
        Assert.Equal("featured", album.EventSlug);
        Assert.Equal(1, album.MediaCount);
        Assert.Equal(1, album.VideoCount);
        Assert.Empty(context.ChangeTracker.Entries());
    }

    [Fact]
    public void GeneratedSqlAppliesDatabasePredicatesAndLimitsWithoutLongCopy()
    {
        using var context = CreateNpgsqlModelContext();
        var repository = new EventRepository(context);

        var listSql = repository.BuildPublicQuery(PublicEventQueryKind.Featured, Now, 50)
            .ToQueryString();
        var homepageSql = repository.BuildHomepageEventQuery(Now, 2, 2).ToQueryString();
        var albumSql = repository.BuildHomepageAlbumQuery(3).ToQueryString();

        Assert.Contains("LIMIT", listSql, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("\"PublicationStatus\"", listSql, StringComparison.Ordinal);
        Assert.Contains("\"IsFeatured\"", listSql, StringComparison.Ordinal);
        Assert.DoesNotContain("LongDescription", listSql, StringComparison.Ordinal);
        Assert.Contains("\"ShowOnHomepage\"", homepageSql, StringComparison.Ordinal);
        Assert.Contains("LIMIT", homepageSql, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("LongDescription", homepageSql, StringComparison.Ordinal);
        Assert.Contains("LIMIT", albumSql, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("LongDescription", albumSql, StringComparison.Ordinal);
    }

    private static TheDomainDbContext CreateInMemoryContext(string databaseName) =>
        new(new DbContextOptionsBuilder<TheDomainDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options);

    private static TheDomainDbContext CreateNpgsqlModelContext() =>
        new(new DbContextOptionsBuilder<TheDomainDbContext>()
            .UseNpgsql("Host=localhost;Database=model_only;Username=test;Password=test")
            .Options);

    private static EntertainmentEvent Published(
        string slug,
        DateTimeOffset start,
        DateTimeOffset end,
        bool featured,
        bool showOnHomepage)
    {
        var item = new EntertainmentEvent(Guid.NewGuid(), slug, $"Title {slug}", "Short",
            $"LONG-COPY-{slug}", "Concert", start, end, "Asia/Amman", "Amman", "Venue",
            null, null, null, false, null, null, featured, showOnHomepage, Now.AddDays(-10));
        item.Publish(Now.AddDays(-5));
        return item;
    }

    private static void AttachMedia(
        EntertainmentEvent item,
        EventMediaUsage usage,
        MediaType mediaType,
        bool featured,
        int sortOrder)
    {
        var id = Guid.NewGuid();
        var extension = mediaType == MediaType.Image ? "jpg" : "mp4";
        var media = new MediaAsset(id, $"{id}.{extension}", $"{id}.{extension}", mediaType,
            $"https://cdn.example.com/{id}.{extension}", null, 1200, 1500,
            mediaType == MediaType.Video ? 10 : null, MediaOrientation.Portrait, null, null,
            "Public media", MediaApprovalStatus.Approved, id.ToString("N"), Now);
        item.AddMedia(new EventMedia(Guid.NewGuid(), item.Id, id, usage, sortOrder, featured, Now),
            media);
    }
}
