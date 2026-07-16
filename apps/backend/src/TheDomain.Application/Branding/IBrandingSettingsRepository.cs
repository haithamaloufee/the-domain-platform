using TheDomain.Domain.Branding;
using TheDomain.Domain.Media;
namespace TheDomain.Application.Branding;
public interface IBrandingSettingsRepository { Task<BrandingSettings?> GetAsync(bool tracking, CancellationToken token); Task<MediaAsset?> FindMediaAsync(Guid id, CancellationToken token); void Add(BrandingSettings settings); Task SaveChangesAsync(CancellationToken token); }
