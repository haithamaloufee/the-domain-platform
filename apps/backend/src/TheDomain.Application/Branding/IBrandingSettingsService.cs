using TheDomain.Application.Events;
namespace TheDomain.Application.Branding;
public interface IBrandingSettingsService { Task<BrandingSettingsResponse> GetAdminAsync(CancellationToken token); Task<PublicBrandingSettingsResponse> GetPublicAsync(CancellationToken token); Task<EventOperationResult<BrandingSettingsResponse>> UpdateAsync(UpdateBrandingSettingsRequest request, CancellationToken token); }
