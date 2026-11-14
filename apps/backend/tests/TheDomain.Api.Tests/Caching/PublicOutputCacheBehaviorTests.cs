using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using TheDomain.Api.Tests.Infrastructure;
using TheDomain.Application.Branding;
using TheDomain.Application.Caching;
using TheDomain.Application.Events;

namespace TheDomain.Api.Tests.Caching;

public sealed class PublicOutputCacheBehaviorTests(ApiWebApplicationFactory factory)
    : IClassFixture<ApiWebApplicationFactory>
{
    [Fact]
    public async Task BrandingResponseIsReusedUntilItsConcreteTagIsEvicted()
    {
        var service = new CountingBrandingService();
        using var cacheFactory = factory.WithWebHostBuilder(builder =>
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<IBrandingSettingsService>();
                services.AddSingleton<IBrandingSettingsService>(service);
            }));
        using var client = cacheFactory.CreateClient();

        using var first = await client.GetAsync("/api/public/branding");
        using var cached = await client.GetAsync("/api/public/branding");

        first.EnsureSuccessStatusCode();
        cached.EnsureSuccessStatusCode();
        Assert.Equal(1, service.PublicExecutions);

        var invalidator = cacheFactory.Services.GetRequiredService<IPublicOutputCacheInvalidator>();
        await invalidator.EvictAsync(default, PublicCacheTags.Branding);
        using var refreshed = await client.GetAsync("/api/public/branding");

        refreshed.EnsureSuccessStatusCode();
        Assert.Equal(2, service.PublicExecutions);
    }

    [Fact]
    public async Task ConcurrentColdRequestsShareOneLockedExecution()
    {
        var service = new CountingBrandingService(delay: TimeSpan.FromMilliseconds(100));
        using var cacheFactory = FactoryWith(service);
        using var client = cacheFactory.CreateClient();

        var requests = Enumerable.Range(0, 10)
            .Select(_ => client.GetAsync("/api/public/branding"))
            .ToArray();
        using var responses = new ResponseBatch(await Task.WhenAll(requests));

        Assert.All(responses.Items, response => response.EnsureSuccessStatusCode());
        Assert.Equal(1, service.PublicExecutions);

        using var warm = await client.GetAsync("/api/public/branding");
        warm.EnsureSuccessStatusCode();
        Assert.Equal(1, service.PublicExecutions);
    }

    [Fact]
    public async Task FailedResponseIsNotCached()
    {
        var service = new CountingBrandingService(failFirstRequest: true);
        using var cacheFactory = FactoryWith(service);
        using var client = cacheFactory.CreateClient();

        using var failed = await client.GetAsync("/api/public/branding");
        using var recovered = await client.GetAsync("/api/public/branding");

        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, failed.StatusCode);
        recovered.EnsureSuccessStatusCode();
        Assert.Equal(2, service.PublicExecutions);
    }

    private WebApplicationFactory<Program> FactoryWith(IBrandingSettingsService service) =>
        factory.WithWebHostBuilder(builder => builder.ConfigureServices(services =>
        {
            services.RemoveAll<IBrandingSettingsService>();
            services.AddSingleton(service);
        }));

    private sealed class CountingBrandingService(
        TimeSpan? delay = null,
        bool failFirstRequest = false) : IBrandingSettingsService
    {
        private static readonly IReadOnlyDictionary<string, string> NoLinks =
            new Dictionary<string, string>();

        private int _publicExecutions;
        private int _failuresRemaining = failFirstRequest ? 1 : 0;

        public int PublicExecutions => Volatile.Read(ref _publicExecutions);

        public async Task<PublicBrandingSettingsResponse> GetPublicAsync(CancellationToken token)
        {
            Interlocked.Increment(ref _publicExecutions);
            if (delay is { } wait) await Task.Delay(wait, token);
            if (Interlocked.CompareExchange(ref _failuresRemaining, 0, 1) == 1)
                throw new InvalidOperationException("Deliberate output-cache failure probe.");
            return new PublicBrandingSettingsResponse(
                null, null, null, null, null, null, null, null, NoLinks);
        }

        public Task<BrandingSettingsResponse> GetAdminAsync(CancellationToken token) =>
            Task.FromResult(new BrandingSettingsResponse(
                null, null, null, null, null, null, null, null,
                null, null, null, null, NoLinks));

        public Task<EventOperationResult<BrandingSettingsResponse>> UpdateAsync(
            UpdateBrandingSettingsRequest request, CancellationToken token) =>
            Task.FromResult(EventOperationResult.Failure<BrandingSettingsResponse>(
                "Not used by the output-cache behavior test."));
    }

    private sealed class ResponseBatch(HttpResponseMessage[] items) : IDisposable
    {
        public IReadOnlyList<HttpResponseMessage> Items { get; } = items;
        public void Dispose()
        {
            foreach (var item in items) item.Dispose();
        }
    }
}
