using Microsoft.AspNetCore.OutputCaching;
using TheDomain.Application.Caching;

namespace TheDomain.Api.Caching;

public sealed class PublicOutputCacheInvalidator(IOutputCacheStore store) : IPublicOutputCacheInvalidator
{
    public async Task EvictAsync(CancellationToken token, params string[] tags)
    {
        foreach (var tag in tags.Where(value => !string.IsNullOrWhiteSpace(value)).Distinct(StringComparer.Ordinal))
            await store.EvictByTagAsync(tag, token);
    }
}
