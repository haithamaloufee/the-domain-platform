using TheDomain.Application.Events;
namespace TheDomain.Application.Branding;
public sealed class DisabledBrandingSettingsService : IBrandingSettingsService
{
    private static readonly PublicBrandingSettingsResponse Public = new("The Domain Entertainment", "Premium entertainment experiences and events in Jordan.", "The Domain Entertainment", "Premium entertainment experiences and events in Jordan.", null, null, null, null, null, null, null, null, new Dictionary<string, string>());
    public Task<PublicBrandingSettingsResponse> GetPublicAsync(CancellationToken token) => Task.FromResult(Public);
    public Task<BrandingSettingsResponse> GetAdminAsync(CancellationToken token) => Task.FromResult(new BrandingSettingsResponse(Public.SiteName, Public.BrandDescription, Public.DefaultSeoTitle, Public.DefaultSeoDescription, null, null, null, null, null, null, null, null, null, null, null, null, Public.SocialLinks));
    public Task<EventOperationResult<BrandingSettingsResponse>> UpdateAsync(UpdateBrandingSettingsRequest request, CancellationToken token) => Task.FromResult(EventOperationResult.Failure<BrandingSettingsResponse>("Branding settings are unavailable while persistence is disabled."));
}
