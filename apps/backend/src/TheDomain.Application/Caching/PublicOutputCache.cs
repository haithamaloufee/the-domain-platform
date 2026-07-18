namespace TheDomain.Application.Caching;

public static class PublicCacheTags
{
    public const string Homepage = "public:homepage";
    public const string Branding = "public:branding";
    public const string About = "public:about";
    public const string Events = "public:events";
    public const string Gallery = "public:gallery";
    public const string Partners = "public:partners";
    public const string Statistics = "public:statistics";
    public const string Media = "public:media";
}

public interface IPublicOutputCacheInvalidator
{
    Task EvictAsync(CancellationToken token, params string[] tags);
}
