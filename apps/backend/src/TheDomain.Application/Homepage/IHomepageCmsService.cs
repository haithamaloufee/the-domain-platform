using TheDomain.Application.Homepage.Contracts;

namespace TheDomain.Application.Homepage;

public interface IHomepageCmsService
{
    Task<PublicHomepageResponse> GetPublicHomepageAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<PublicStatisticResponse>> GetPublicStatisticsAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<PublicPartnerResponse>> GetPublicPartnersAsync(CancellationToken cancellationToken);
    Task<AdminHomepageContentResponse?> GetAdminHomepageAsync(CancellationToken cancellationToken);
    Task<CmsOperationResult<AdminHomepageContentResponse>> UpdateHomepageAsync(UpdateHomepageContentRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyList<AdminStatisticResponse>> GetAdminStatisticsAsync(CancellationToken cancellationToken);
    Task<CmsOperationResult<AdminStatisticResponse>> CreateStatisticAsync(SaveStatisticRequest request, CancellationToken cancellationToken);
    Task<CmsOperationResult<AdminStatisticResponse>> UpdateStatisticAsync(Guid id, SaveStatisticRequest request, CancellationToken cancellationToken);
    Task<CmsOperationResult<AdminStatisticResponse>> SetStatisticVisibilityAsync(Guid id, bool visible, CancellationToken cancellationToken);
    Task<IReadOnlyList<AdminPartnerResponse>> GetAdminPartnersAsync(CancellationToken cancellationToken);
    Task<CmsOperationResult<AdminPartnerResponse>> CreatePartnerAsync(SavePartnerRequest request, CancellationToken cancellationToken);
    Task<CmsOperationResult<AdminPartnerResponse>> UpdatePartnerAsync(Guid id, SavePartnerRequest request, CancellationToken cancellationToken);
    Task<CmsOperationResult<AdminPartnerResponse>> SetPartnerVisibilityAsync(Guid id, bool visible, CancellationToken cancellationToken);
}
