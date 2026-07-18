using Microsoft.AspNetCore.OutputCaching;
using TheDomain.Api.Caching;

namespace TheDomain.Api.Tests.Caching;

public sealed class PublicOutputCacheInvalidatorTests
{
    [Fact]
    public async Task EvictsEveryDistinctNonEmptyTagThroughTheNet8StoreApi()
    {
        var store = new RecordingStore();
        var invalidator = new PublicOutputCacheInvalidator(store);

        await invalidator.EvictAsync(default, "public:homepage", "public:media", "public:homepage", " ");

        Assert.Equal(["public:homepage", "public:media"], store.EvictedTags);
    }

    private sealed class RecordingStore : IOutputCacheStore
    {
        public List<string> EvictedTags { get; } = [];

        public ValueTask EvictByTagAsync(string tag, CancellationToken cancellationToken)
        {
            EvictedTags.Add(tag);
            return ValueTask.CompletedTask;
        }

        public ValueTask<byte[]?> GetAsync(string key, CancellationToken cancellationToken) =>
            ValueTask.FromResult<byte[]?>(null);

        public ValueTask SetAsync(string key, byte[] value, string[]? tags,
            TimeSpan validFor, CancellationToken cancellationToken) => ValueTask.CompletedTask;
    }
}
