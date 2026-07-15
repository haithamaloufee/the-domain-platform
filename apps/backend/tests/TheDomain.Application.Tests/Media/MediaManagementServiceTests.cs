using TheDomain.Application.Media;
using TheDomain.Application.Media.Contracts;
using TheDomain.Domain.Events;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Tests.Media;

public sealed class MediaManagementServiceTests
{
    [Fact]
    public async Task MediaListCapsPageSize()
    {
        var service = CreateService(new FakeRepository());
        var result = await service.GetAsync(new MediaListQuery(PageNumber: 1, PageSize: 500), CancellationToken.None);
        Assert.Equal(50, result.PageSize);
    }

    [Fact]
    public async Task AssignmentRejectsInvalidEvent()
    {
        var repository = new FakeRepository { Media = CreateMedia(MediaApprovalStatus.Approved) };
        var result = await CreateService(repository).AssignAsync(Guid.NewGuid(), new AssignEventMediaRequest(repository.Media.Id, EventMediaUsage.Gallery, 0, false), CancellationToken.None);
        Assert.False(result.IsSuccess); Assert.Contains("Event was not found.", result.Errors);
    }

    [Fact]
    public async Task EventMediaListIncludesAssignmentAndAssetMetadataInOrder()
    {
        var repository = new FakeRepository { Event = CreateEvent(), Media = CreateMedia(MediaApprovalStatus.Approved) };
        var later = new EventMedia(Guid.NewGuid(), repository.Event.Id, repository.Media.Id, EventMediaUsage.Gallery, 20, false, DateTimeOffset.UtcNow);
        var earlier = new EventMedia(Guid.NewGuid(), repository.Event.Id, repository.Media.Id, EventMediaUsage.Gallery, 10, true, DateTimeOffset.UtcNow.AddMinutes(-1));
        repository.Event.AddMedia(earlier, repository.Media);
        repository.Event.AddMedia(later, repository.Media);
        repository.EventMedia = [later, earlier];

        var result = await CreateService(repository).GetEventMediaAsync(repository.Event.Id, CancellationToken.None);

        Assert.Equal([earlier.Id, later.Id], result.Select(item => item.Id));
        Assert.All(result, item => Assert.Equal(repository.Media.Id, item.Media.Id));
        Assert.True(result[0].IsFeatured);
    }

    [Fact]
    public async Task RepeatingAssignmentIsIdempotent()
    {
        var repository = new FakeRepository { Media = CreateMedia(MediaApprovalStatus.Approved), Event = CreateEvent() };
        var existing = AddAssignment(repository, repository.Media, EventMediaUsage.Cover, 0);
        var result = await CreateService(repository).AssignAsync(repository.Event.Id, new AssignEventMediaRequest(repository.Media.Id, EventMediaUsage.Gallery, 0, false), CancellationToken.None);
        Assert.True(result.IsSuccess);
        Assert.Equal(existing.Id, result.Value!.Id);
        Assert.Single(repository.EventMediaItems);
    }

    [Fact]
    public async Task FirstApprovedImageBecomesCoverAndSecondDoesNotReplaceIt()
    {
        var first = CreateMedia(MediaApprovalStatus.Approved);
        var second = CreateMedia(MediaApprovalStatus.Approved);
        var repository = new FakeRepository { Media = first, Event = CreateEvent() };
        repository.AdditionalMedia.Add(second);
        var service = CreateService(repository);

        var firstResult = await service.AssignAsync(repository.Event.Id,
            new AssignEventMediaRequest(first.Id, EventMediaUsage.Gallery, 0, false), CancellationToken.None);
        Assert.Single(repository.EventMediaItems);
        var secondResult = await service.AssignAsync(repository.Event.Id,
            new AssignEventMediaRequest(second.Id, EventMediaUsage.Gallery, 99, false), CancellationToken.None);

        Assert.Equal(EventMediaUsage.Cover, firstResult.Value!.Usage);
        Assert.Equal(EventMediaUsage.Gallery, secondResult.Value!.Usage);
        Assert.Single(repository.EventMediaItems, item => item.Usage == EventMediaUsage.Cover);
        Assert.Equal(first.Id, repository.EventMediaItems.Single(item => item.Usage == EventMediaUsage.Cover).MediaAssetId);
        Assert.Equal([0, 1], repository.EventMediaItems.OrderBy(item => item.SortOrder).Select(item => item.SortOrder));
    }

    [Fact]
    public async Task DraftMayBeAssignedButDoesNotBecomeCover()
    {
        var draft = CreateMedia(MediaApprovalStatus.Draft);
        var repository = new FakeRepository { Media = draft, Event = CreateEvent() };

        var result = await CreateService(repository).AssignAsync(repository.Event.Id,
            new AssignEventMediaRequest(draft.Id, EventMediaUsage.Gallery, 0, false), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(EventMediaUsage.Gallery, result.Value!.Usage);
        Assert.DoesNotContain(repository.EventMediaItems, item => item.Usage == EventMediaUsage.Cover);
    }

    [Theory]
    [InlineData(MediaApprovalStatus.Draft, MediaType.Image, "Draft media must be approved")]
    [InlineData(MediaApprovalStatus.Hidden, MediaType.Image, "Hidden media cannot")]
    [InlineData(MediaApprovalStatus.Approved, MediaType.Video, "Only image media")]
    public async Task IneligibleMediaCannotBecomeCover(MediaApprovalStatus status, MediaType type, string expected)
    {
        var media = CreateMedia(status, type);
        var repository = new FakeRepository { Media = media, Event = CreateEvent() };

        var result = await CreateService(repository).AssignAsync(repository.Event.Id,
            new AssignEventMediaRequest(media.Id, EventMediaUsage.Cover, 0, false), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Contains(result.Errors, error => error.Contains(expected, StringComparison.Ordinal));
        Assert.Empty(repository.EventMediaItems);
    }

    [Fact]
    public async Task SetCoverAtomicallyReplacesPreviousCoverAndIsIdempotent()
    {
        var first = CreateMedia(MediaApprovalStatus.Approved);
        var second = CreateMedia(MediaApprovalStatus.Approved);
        var repository = new FakeRepository { Media = first, Event = CreateEvent() };
        repository.AdditionalMedia.Add(second);
        var oldCover = AddAssignment(repository, first, EventMediaUsage.Cover, 0);
        var replacement = AddAssignment(repository, second, EventMediaUsage.Gallery, 1);
        var service = CreateService(repository);

        var firstChange = await service.SetCoverAsync(repository.Event.Id, replacement.Id, CancellationToken.None);
        var secondChange = await service.SetCoverAsync(repository.Event.Id, replacement.Id, CancellationToken.None);

        Assert.True(firstChange.IsSuccess);
        Assert.True(secondChange.IsSuccess);
        Assert.Equal(replacement.Id, secondChange.Value!.Id);
        Assert.Equal(EventMediaUsage.Gallery, oldCover.Usage);
        Assert.Equal(EventMediaUsage.Cover, replacement.Usage);
        Assert.Single(repository.EventMediaItems, item => item.Usage == EventMediaUsage.Cover);
        Assert.Equal(1, repository.SaveCount);
    }

    [Fact]
    public void LegacyEventMediaUsesCenteredNeutralPresentationDefaults()
    {
        var item = new EventMedia(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(),
            EventMediaUsage.Cover, 0, true, DateTimeOffset.UtcNow);

        Assert.Equal(0.5, item.FocalPointX);
        Assert.Equal(0.5, item.FocalPointY);
        Assert.Equal(1.0, item.Zoom);
    }

    [Theory]
    [InlineData(0.0, 0.0, 1.0)]
    [InlineData(1.0, 1.0, 3.0)]
    [InlineData(0.25, 0.75, 1.8)]
    public async Task ValidCoverPresentationPersistsIncludingBoundaries(
        double focalPointX, double focalPointY, double zoom)
    {
        var repository = new FakeRepository
        {
            Media = CreateMedia(MediaApprovalStatus.Approved), Event = CreateEvent()
        };
        var cover = AddAssignment(repository, repository.Media, EventMediaUsage.Cover, 0);

        var result = await CreateService(repository).UpdateCoverPresentationAsync(
            repository.Event.Id, cover.Id,
            new UpdateEventCoverPresentationRequest(focalPointX, focalPointY, zoom),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(focalPointX, cover.FocalPointX);
        Assert.Equal(focalPointY, cover.FocalPointY);
        Assert.Equal(zoom, cover.Zoom);
        Assert.Equal(focalPointX, result.Value!.Presentation.FocalPointX);
        Assert.Equal(1, repository.SaveCount);
    }

    [Theory]
    [InlineData(-0.01, 0.5, 1.0)]
    [InlineData(1.01, 0.5, 1.0)]
    [InlineData(0.5, -0.01, 1.0)]
    [InlineData(0.5, 1.01, 1.0)]
    [InlineData(0.5, 0.5, 0.99)]
    [InlineData(0.5, 0.5, 3.01)]
    public async Task OutOfRangeCoverPresentationIsRejected(
        double focalPointX, double focalPointY, double zoom)
    {
        var repository = new FakeRepository
        {
            Media = CreateMedia(MediaApprovalStatus.Approved), Event = CreateEvent()
        };
        var cover = AddAssignment(repository, repository.Media, EventMediaUsage.Cover, 0);

        var result = await CreateService(repository).UpdateCoverPresentationAsync(
            repository.Event.Id, cover.Id,
            new UpdateEventCoverPresentationRequest(focalPointX, focalPointY, zoom),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(0, repository.SaveCount);
        Assert.Equal(EventMedia.DefaultFocalPoint, cover.FocalPointX);
        Assert.Equal(EventMedia.DefaultZoom, cover.Zoom);
    }

    [Fact]
    public async Task NonFiniteCoverPresentationIsRejected()
    {
        var repository = new FakeRepository
        {
            Media = CreateMedia(MediaApprovalStatus.Approved), Event = CreateEvent()
        };
        var cover = AddAssignment(repository, repository.Media, EventMediaUsage.Cover, 0);
        var service = CreateService(repository);

        var nan = await service.UpdateCoverPresentationAsync(repository.Event.Id, cover.Id,
            new UpdateEventCoverPresentationRequest(double.NaN, 0.5, 1), CancellationToken.None);
        var infinity = await service.UpdateCoverPresentationAsync(repository.Event.Id, cover.Id,
            new UpdateEventCoverPresentationRequest(0.5, 0.5, double.PositiveInfinity),
            CancellationToken.None);

        Assert.False(nan.IsSuccess);
        Assert.False(infinity.IsSuccess);
        Assert.Equal(0, repository.SaveCount);
    }

    [Fact]
    public async Task CoverPresentationRequiresExistingEventAndActiveAssignedCover()
    {
        var repository = new FakeRepository
        {
            Media = CreateMedia(MediaApprovalStatus.Approved), Event = CreateEvent()
        };
        var gallery = AddAssignment(repository, repository.Media, EventMediaUsage.Gallery, 0);
        var service = CreateService(repository);
        var request = new UpdateEventCoverPresentationRequest(0.3, 0.4, 1.5);

        var missingEvent = await service.UpdateCoverPresentationAsync(
            Guid.NewGuid(), gallery.Id, request, CancellationToken.None);
        var missingAssignment = await service.UpdateCoverPresentationAsync(
            repository.Event.Id, Guid.NewGuid(), request, CancellationToken.None);
        var nonCover = await service.UpdateCoverPresentationAsync(
            repository.Event.Id, gallery.Id, request, CancellationToken.None);

        Assert.False(missingEvent.IsSuccess);
        Assert.Contains("Event was not found.", missingEvent.Errors);
        Assert.False(missingAssignment.IsSuccess);
        Assert.Contains("Event media assignment was not found.", missingAssignment.Errors);
        Assert.False(nonCover.IsSuccess);
        Assert.Contains(nonCover.Errors, error => error.Contains("active event cover"));
        Assert.Equal(0, repository.SaveCount);
    }

    [Fact]
    public async Task RepeatedIdenticalCoverPresentationSaveIsIdempotent()
    {
        var repository = new FakeRepository
        {
            Media = CreateMedia(MediaApprovalStatus.Approved), Event = CreateEvent()
        };
        var cover = AddAssignment(repository, repository.Media, EventMediaUsage.Cover, 0);
        var service = CreateService(repository);
        var request = new UpdateEventCoverPresentationRequest(0.2, 0.8, 2);

        var first = await service.UpdateCoverPresentationAsync(
            repository.Event.Id, cover.Id, request, CancellationToken.None);
        var second = await service.UpdateCoverPresentationAsync(
            repository.Event.Id, cover.Id, request, CancellationToken.None);

        Assert.True(first.IsSuccess);
        Assert.True(second.IsSuccess);
        Assert.Equal(1, repository.SaveCount);
        Assert.Equal(first.Value!.Presentation, second.Value!.Presentation);
    }

    [Fact]
    public async Task ReplacingCoverDoesNotTransferPreviousPresentation()
    {
        var first = CreateMedia(MediaApprovalStatus.Approved);
        var second = CreateMedia(MediaApprovalStatus.Approved);
        var repository = new FakeRepository { Media = first, Event = CreateEvent() };
        repository.AdditionalMedia.Add(second);
        var oldCover = AddAssignment(repository, first, EventMediaUsage.Cover, 0);
        oldCover.UpdatePresentation(0.1, 0.9, 2.25);
        var replacement = AddAssignment(repository, second, EventMediaUsage.Gallery, 1);

        var result = await CreateService(repository).SetCoverAsync(
            repository.Event.Id, replacement.Id, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(0.5, replacement.FocalPointX);
        Assert.Equal(0.5, replacement.FocalPointY);
        Assert.Equal(1.0, replacement.Zoom);
        Assert.Equal(0.1, oldCover.FocalPointX);
    }

    [Fact]
    public async Task HidingCoverInvalidatesCoverWithoutRemovingOtherAssignments()
    {
        var coverMedia = CreateMedia(MediaApprovalStatus.Approved);
        var otherMedia = CreateMedia(MediaApprovalStatus.Approved);
        var repository = new FakeRepository { Media = coverMedia, Event = CreateEvent() };
        repository.AdditionalMedia.Add(otherMedia);
        var cover = AddAssignment(repository, coverMedia, EventMediaUsage.Cover, 0);
        var other = AddAssignment(repository, otherMedia, EventMediaUsage.Gallery, 1);

        var result = await CreateService(repository).HideAsync(coverMedia.Id, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(MediaApprovalStatus.Hidden, result.Value!.ApprovalStatus);
        Assert.Equal(EventMediaUsage.Gallery, cover.Usage);
        Assert.Contains(other, repository.EventMediaItems);
        Assert.DoesNotContain(repository.EventMediaItems, item => item.Usage == EventMediaUsage.Cover);
    }

    [Fact]
    public async Task RemovingCoverClearsOnlyCoverAssignment()
    {
        var coverMedia = CreateMedia(MediaApprovalStatus.Approved);
        var otherMedia = CreateMedia(MediaApprovalStatus.Approved);
        var repository = new FakeRepository { Media = coverMedia, Event = CreateEvent() };
        repository.AdditionalMedia.Add(otherMedia);
        var cover = AddAssignment(repository, coverMedia, EventMediaUsage.Cover, 0);
        var other = AddAssignment(repository, otherMedia, EventMediaUsage.Gallery, 1);

        var removed = await CreateService(repository).RemoveAssignmentAsync(
            repository.Event.Id, cover.Id, CancellationToken.None);

        Assert.True(removed);
        Assert.DoesNotContain(cover, repository.EventMediaItems);
        Assert.Contains(other, repository.EventMediaItems);
        Assert.DoesNotContain(repository.EventMediaItems, item => item.Usage == EventMediaUsage.Cover);
    }

    [Fact]
    public async Task RemovingUnrelatedAssignmentPreservesCover()
    {
        var coverMedia = CreateMedia(MediaApprovalStatus.Approved);
        var otherMedia = CreateMedia(MediaApprovalStatus.Approved);
        var repository = new FakeRepository { Media = coverMedia, Event = CreateEvent() };
        repository.AdditionalMedia.Add(otherMedia);
        var cover = AddAssignment(repository, coverMedia, EventMediaUsage.Cover, 0);
        var other = AddAssignment(repository, otherMedia, EventMediaUsage.Gallery, 1);

        var removed = await CreateService(repository).RemoveAssignmentAsync(
            repository.Event.Id, other.Id, CancellationToken.None);

        Assert.True(removed);
        Assert.Contains(cover, repository.EventMediaItems);
        Assert.Equal(EventMediaUsage.Cover, cover.Usage);
    }

    [Fact]
    public async Task ReorderPersistsStableOrderWithoutChangingCover()
    {
        var coverMedia = CreateMedia(MediaApprovalStatus.Approved);
        var secondMedia = CreateMedia(MediaApprovalStatus.Approved);
        var thirdMedia = CreateMedia(MediaApprovalStatus.Approved);
        var repository = new FakeRepository { Media = coverMedia, Event = CreateEvent() };
        repository.AdditionalMedia.AddRange([secondMedia, thirdMedia]);
        var cover = AddAssignment(repository, coverMedia, EventMediaUsage.Cover, 0);
        var second = AddAssignment(repository, secondMedia, EventMediaUsage.Gallery, 1);
        var third = AddAssignment(repository, thirdMedia, EventMediaUsage.Poster, 2);

        var result = await CreateService(repository).ReorderAsync(repository.Event.Id,
            new ReorderEventMediaRequest([third.Id, cover.Id, second.Id]), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal([third.Id, cover.Id, second.Id], result.Value!.Select(item => item.Id));
        Assert.Equal(EventMediaUsage.Cover, cover.Usage);
        Assert.Equal([0, 1, 2], repository.EventMediaItems.OrderBy(item => item.SortOrder).Select(item => item.SortOrder));
    }

    [Fact]
    public async Task InvalidReorderIsRejectedWithoutPersistence()
    {
        var firstMedia = CreateMedia(MediaApprovalStatus.Approved);
        var secondMedia = CreateMedia(MediaApprovalStatus.Approved);
        var repository = new FakeRepository { Media = firstMedia, Event = CreateEvent() };
        repository.AdditionalMedia.Add(secondMedia);
        var first = AddAssignment(repository, firstMedia, EventMediaUsage.Cover, 0);
        var second = AddAssignment(repository, secondMedia, EventMediaUsage.Gallery, 1);
        var service = CreateService(repository);

        var duplicate = await service.ReorderAsync(repository.Event.Id,
            new ReorderEventMediaRequest([first.Id, first.Id]), CancellationToken.None);
        var missing = await service.ReorderAsync(repository.Event.Id,
            new ReorderEventMediaRequest([first.Id]), CancellationToken.None);
        var foreign = await service.ReorderAsync(repository.Event.Id,
            new ReorderEventMediaRequest([first.Id, Guid.NewGuid()]), CancellationToken.None);

        Assert.False(duplicate.IsSuccess);
        Assert.False(missing.IsSuccess);
        Assert.False(foreign.IsSuccess);
        Assert.Equal(0, repository.SaveCount);
        Assert.Equal([first.Id, second.Id], repository.EventMediaItems
            .OrderBy(item => item.SortOrder).Select(item => item.Id));
    }

    [Fact]
    public async Task PublicGalleryIncludesOnlyApprovedMedia()
    {
        var eventEntity = CreateEvent(); eventEntity.Publish(DateTimeOffset.UtcNow.AddDays(-1));
        var approved = CreateMedia(MediaApprovalStatus.Approved); var draft = CreateMedia(MediaApprovalStatus.Draft); var hidden = CreateMedia(MediaApprovalStatus.Hidden);
        eventEntity.AddMedia(new EventMedia(Guid.NewGuid(), eventEntity.Id, approved.Id, EventMediaUsage.Gallery, 0, false, DateTimeOffset.UtcNow), approved);
        eventEntity.AddMedia(new EventMedia(Guid.NewGuid(), eventEntity.Id, draft.Id, EventMediaUsage.Gallery, 1, false, DateTimeOffset.UtcNow), draft);
        eventEntity.AddMedia(new EventMedia(Guid.NewGuid(), eventEntity.Id, hidden.Id, EventMediaUsage.Gallery, 2, false, DateTimeOffset.UtcNow), hidden);
        var events = new EventRepositoryFake(eventEntity);
        var service = new TheDomain.Application.Events.EventService(events, TimeProvider.System);
        var albums = await service.GetGalleryAlbumsAsync(CancellationToken.None);
        var album = await service.GetGalleryAlbumAsync(eventEntity.Slug, CancellationToken.None);
        Assert.Single(albums); Assert.Equal(1, albums[0].MediaCount);
        Assert.NotNull(album); Assert.Single(album.Media); Assert.Equal(approved.Id, album.Media[0].Id);
    }

    [Fact]
    public async Task PublicEventListAndDetailsReturnTheSameApprovedImageCover()
    {
        var eventEntity = CreateEvent(); eventEntity.Publish(DateTimeOffset.UtcNow.AddDays(-1));
        var hero = CreateMedia(MediaApprovalStatus.Approved);
        var gallery = CreateMedia(MediaApprovalStatus.Approved);
        eventEntity.AddMedia(new EventMedia(Guid.NewGuid(), eventEntity.Id, gallery.Id, EventMediaUsage.Gallery, 0, false, DateTimeOffset.UtcNow), gallery);
        eventEntity.AddMedia(new EventMedia(Guid.NewGuid(), eventEntity.Id, hero.Id, EventMediaUsage.Cover, 10, true, DateTimeOffset.UtcNow), hero);
        var service = new TheDomain.Application.Events.EventService(new EventRepositoryFake(eventEntity), TimeProvider.System);

        var events = await service.GetUpcomingAsync(CancellationToken.None);
        var details = await service.GetPublicBySlugAsync(eventEntity.Slug, CancellationToken.None);

        Assert.Single(events);
        Assert.Equal(hero.Id, events[0].CoverMedia?.Id);
        Assert.NotNull(details);
        Assert.Equal(2, details.Media.Count);
        Assert.Equal(gallery.Id, details.Media[0].Id);
        Assert.Equal(hero.Id, details.CoverMedia?.Id);
    }

    [Fact]
    public async Task PublicEventListAndDetailsReturnTheSameCoverPresentation()
    {
        var eventEntity = CreateEvent(); eventEntity.Publish(DateTimeOffset.UtcNow.AddDays(-1));
        var media = CreateMedia(MediaApprovalStatus.Approved);
        var cover = new EventMedia(Guid.NewGuid(), eventEntity.Id, media.Id,
            EventMediaUsage.Cover, 0, true, DateTimeOffset.UtcNow, 0.2, 0.7, 1.75);
        eventEntity.AddMedia(cover, media);
        var service = new TheDomain.Application.Events.EventService(
            new EventRepositoryFake(eventEntity), TimeProvider.System);

        var events = await service.GetUpcomingAsync(CancellationToken.None);
        var details = await service.GetPublicBySlugAsync(eventEntity.Slug, CancellationToken.None);

        Assert.Equal(new EventCoverPresentationResponse(0.2, 0.7, 1.75),
            events[0].CoverMedia?.Presentation);
        Assert.Equal(events[0].CoverMedia?.Presentation, details?.CoverMedia?.Presentation);
    }

    [Theory]
    [InlineData(MediaApprovalStatus.Draft)]
    [InlineData(MediaApprovalStatus.Hidden)]
    public async Task PublicQueriesDoNotExposeIneligibleCover(MediaApprovalStatus status)
    {
        var eventEntity = CreateEvent(); eventEntity.Publish(DateTimeOffset.UtcNow.AddDays(-1));
        var media = CreateMedia(status);
        eventEntity.AddMedia(new EventMedia(Guid.NewGuid(), eventEntity.Id, media.Id,
            EventMediaUsage.Cover, 0, true, DateTimeOffset.UtcNow), media);
        var service = new TheDomain.Application.Events.EventService(new EventRepositoryFake(eventEntity), TimeProvider.System);

        var list = await service.GetUpcomingAsync(CancellationToken.None);
        var details = await service.GetPublicBySlugAsync(eventEntity.Slug, CancellationToken.None);

        Assert.Single(list);
        Assert.Null(list[0].CoverMedia);
        Assert.NotNull(details);
        Assert.Null(details.CoverMedia);
        Assert.Empty(details.Media);
    }

    [Fact]
    public async Task UnsafeHttpImageIsNotExposedAsPublicCover()
    {
        var eventEntity = CreateEvent(); eventEntity.Publish(DateTimeOffset.UtcNow.AddDays(-1));
        var media = CreateMedia(MediaApprovalStatus.Approved, MediaType.Image, "http://legacy.example.com/media.jpg");
        eventEntity.AddMedia(new EventMedia(Guid.NewGuid(), eventEntity.Id, media.Id,
            EventMediaUsage.Cover, 0, true, DateTimeOffset.UtcNow), media);
        var service = new TheDomain.Application.Events.EventService(new EventRepositoryFake(eventEntity), TimeProvider.System);

        var result = await service.GetUpcomingAsync(CancellationToken.None);

        Assert.Single(result);
        Assert.Null(result[0].CoverMedia);
    }

    [Fact]
    public async Task PublicGalleryResolvesThumbnailForPreviouslyStoredVideo()
    {
        var eventEntity = CreateEvent();
        eventEntity.Publish(DateTimeOffset.UtcNow.AddDays(-1));
        var video = new MediaAsset(
            Guid.NewGuid(), "legacy.mp4", "legacy.mp4", MediaType.Video,
            "https://res.cloudinary.com/test-cloud/video/upload/v1/the-domain/legacy.mp4", null,
            854, 480, 13, MediaOrientation.Landscape, null, null, "Legacy video",
            MediaApprovalStatus.Approved, "the-domain/legacy", DateTimeOffset.UtcNow);
        eventEntity.AddMedia(new EventMedia(Guid.NewGuid(), eventEntity.Id, video.Id, EventMediaUsage.Gallery, 0, true, DateTimeOffset.UtcNow), video);
        var service = new TheDomain.Application.Events.EventService(
            new EventRepositoryFake(eventEntity),
            TimeProvider.System,
            new FakeDeliveryUrlResolver());

        var album = await service.GetGalleryAlbumAsync(eventEntity.Slug, CancellationToken.None);

        Assert.NotNull(album);
        Assert.Equal("https://cdn.example.com/legacy-poster.jpg", album.Media[0].ThumbnailUrl);
    }

    private static MediaManagementService CreateService(FakeRepository repository) => new(repository, new FakeStorage(), new MediaUploadPolicy(10, 20, new Dictionary<string, string[]> { ["image/jpeg"] = [".jpg"] }), TimeProvider.System);
    private static MediaAsset CreateMedia(MediaApprovalStatus status, MediaType type = MediaType.Image, string? url = null)
    {
        var extension = type == MediaType.Image ? "jpg" : "mp4";
        return new MediaAsset(Guid.NewGuid(), $"media.{extension}", $"media.{extension}", type,
            url ?? $"https://res.cloudinary.com/test-cloud/{(type == MediaType.Image ? "image" : "video")}/upload/media.{extension}",
            type == MediaType.Video ? "https://res.cloudinary.com/test-cloud/video/upload/media.jpg" : null,
            100, 100, type == MediaType.Video ? 5 : null, MediaOrientation.Square, null, null, "Alt",
            status, Guid.NewGuid().ToString("N"), DateTimeOffset.UtcNow);
    }
    private static EventMedia AddAssignment(FakeRepository repository, MediaAsset media, EventMediaUsage usage, int order)
    {
        var item = new EventMedia(Guid.NewGuid(), repository.Event!.Id, media.Id, usage, order,
            usage == EventMediaUsage.Cover, DateTimeOffset.UtcNow.AddSeconds(order));
        repository.AddEventMedia(item);
        return item;
    }
    private static EntertainmentEvent CreateEvent() { var now = DateTimeOffset.UtcNow; return new(Guid.NewGuid(), "event", "Event", "Short", "Long", "Concert", now.AddDays(1), now.AddDays(2), "Asia/Amman", "Amman", "Venue", null, null, null, false, null, null, false, false, now); }

    private sealed class FakeStorage : IMediaStorageService
    { public Task<StoredMediaResult> UploadAsync(Stream content, string fileName, string publicId, MediaType mediaType, CancellationToken cancellationToken) => Task.FromResult(new StoredMediaResult("https://example.com/media.jpg", null, publicId, 100, 100, null)); public Task DeleteAsync(string publicId, MediaType mediaType, CancellationToken cancellationToken) => Task.CompletedTask; }
    private sealed class FakeDeliveryUrlResolver : IMediaDeliveryUrlResolver
    {
        public string? ResolveThumbnailUrl(MediaType mediaType, string mediaUrl, string? thumbnailUrl, string? storagePublicId) =>
            thumbnailUrl ?? (mediaType == MediaType.Video ? "https://cdn.example.com/legacy-poster.jpg" : null);
    }
    private sealed class FakeRepository : IMediaRepository
    {
        public MediaAsset Media { get; init; } = CreateMedia(MediaApprovalStatus.Approved);
        public List<MediaAsset> AdditionalMedia { get; } = [];
        public EntertainmentEvent? Event { get; init; }
        public IReadOnlyList<EventMedia> EventMedia
        {
            get => EventMediaItems;
            set
            {
                EventMediaItems.Clear();
                EventMediaItems.AddRange(value);
            }
        }
        public List<EventMedia> EventMediaItems { get; } = [];
        public int SaveCount { get; private set; }
        private IEnumerable<MediaAsset> AllMedia => AdditionalMedia.Prepend(Media).DistinctBy(item => item.Id);
        public Task<(IReadOnlyList<MediaAsset> Items, int TotalCount)> SearchAsync(MediaListQuery query, CancellationToken token) =>
            Task.FromResult<(IReadOnlyList<MediaAsset>, int)>((AllMedia.ToArray(), AllMedia.Count()));
        public Task<MediaAsset?> FindMediaAsync(Guid id, CancellationToken token) => Task.FromResult(AllMedia.SingleOrDefault(item => item.Id == id));
        public Task<EntertainmentEvent?> FindEventAsync(Guid id, CancellationToken token) => Task.FromResult(Event?.Id == id ? Event : null);
        public Task<IReadOnlyList<EventMedia>> ListEventMediaAsync(Guid eventId, CancellationToken token) => Task.FromResult<IReadOnlyList<EventMedia>>(EventMediaItems.Where(item => item.EventId == eventId).ToArray());
        public Task<IReadOnlyList<EventMedia>> ListEventMediaForUpdateAsync(Guid eventId, CancellationToken token) => Task.FromResult<IReadOnlyList<EventMedia>>(EventMediaItems.Where(item => item.EventId == eventId).ToArray());
        public Task<IReadOnlyList<EventMedia>> ListMediaAssignmentsForUpdateAsync(Guid mediaAssetId, CancellationToken token) => Task.FromResult<IReadOnlyList<EventMedia>>(EventMediaItems.Where(item => item.MediaAssetId == mediaAssetId).ToArray());
        public Task<EventMedia?> FindEventMediaAsync(Guid eventId, Guid eventMediaId, CancellationToken token) => Task.FromResult(EventMediaItems.SingleOrDefault(item => item.EventId == eventId && item.Id == eventMediaId));
        public Task<bool> AssignmentExistsAsync(Guid eventId, Guid mediaAssetId, EventMediaUsage usage, Guid? excludingId, CancellationToken token) => Task.FromResult(EventMediaItems.Any(item => item.EventId == eventId && item.MediaAssetId == mediaAssetId && item.Usage == usage && (!excludingId.HasValue || item.Id != excludingId.Value)));
        public void AddMedia(MediaAsset media) => AdditionalMedia.Add(media);
        public void AddEventMedia(EventMedia eventMedia)
        {
            EventMediaItems.Add(eventMedia);
            var media = AllMedia.Single(item => item.Id == eventMedia.MediaAssetId);
            Event?.AddMedia(eventMedia, media);
        }
        public void RemoveEventMedia(EventMedia eventMedia) => EventMediaItems.Remove(eventMedia);
        public Task SaveChangesAsync(CancellationToken token) { SaveCount++; return Task.CompletedTask; }
    }
    private sealed class EventRepositoryFake(params EntertainmentEvent[] events) : TheDomain.Application.Events.IEventRepository
    {
        public Task<IReadOnlyList<EntertainmentEvent>> ListAsync(CancellationToken cancellationToken) => Task.FromResult<IReadOnlyList<EntertainmentEvent>>(events);
        public Task<EntertainmentEvent?> FindByIdAsync(Guid id, CancellationToken cancellationToken) => Task.FromResult(events.SingleOrDefault(item => item.Id == id));
        public Task<EntertainmentEvent?> FindBySlugAsync(string slug, CancellationToken cancellationToken) => Task.FromResult(events.SingleOrDefault(item => item.Slug == slug));
        public Task<bool> SlugExistsAsync(string slug, Guid? excludingId, CancellationToken cancellationToken) => Task.FromResult(false);
        public void Add(EntertainmentEvent eventEntity) { } public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
