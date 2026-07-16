using Microsoft.EntityFrameworkCore;
using TheDomain.Application.Branding;
using TheDomain.Domain.Branding;
using TheDomain.Domain.Media;
namespace TheDomain.Infrastructure.Persistence;
public sealed class BrandingSettingsRepository(TheDomainDbContext db) : IBrandingSettingsRepository
{
    public Task<BrandingSettings?> GetAsync(bool tracking, CancellationToken token) { var query = db.BrandingSettings.AsQueryable(); if (!tracking) query = query.AsNoTracking(); return query.SingleOrDefaultAsync(item => item.Id == BrandingSettings.SingletonId, token); }
    public Task<MediaAsset?> FindMediaAsync(Guid id, CancellationToken token) => db.MediaAssets.AsNoTracking().SingleOrDefaultAsync(item => item.Id == id, token);
    public void Add(BrandingSettings settings) => db.BrandingSettings.Add(settings);
    public Task SaveChangesAsync(CancellationToken token) => db.SaveChangesAsync(token);
}
