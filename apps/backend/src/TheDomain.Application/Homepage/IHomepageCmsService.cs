using TheDomain.Application.Homepage.Contracts;

namespace TheDomain.Application.Homepage;

public interface IHomepageCmsService
{
    Task<PublicHomepageResponse> GetPublicHomepageAsync(CancellationToken token);
    Task<IReadOnlyList<PublicStatisticResponse>> GetPublicStatisticsAsync(CancellationToken token);
    Task<IReadOnlyList<PublicPartnerResponse>> GetPublicPartnersAsync(CancellationToken token);
    Task<AdminHomepageContentResponse?> GetAdminHomepageAsync(CancellationToken token);
    Task<CmsOperationResult<AdminHomepageContentResponse>> UpdateHomepageAsync(UpdateHomepageContentRequest request, CancellationToken token);
    Task<IReadOnlyList<AdminStatisticResponse>> GetAdminStatisticsAsync(CancellationToken token);
    Task<CmsOperationResult<AdminStatisticResponse>> CreateStatisticAsync(SaveStatisticRequest request, CancellationToken token);
    Task<CmsOperationResult<AdminStatisticResponse>> UpdateStatisticAsync(Guid id, SaveStatisticRequest request, CancellationToken token);
    Task<CmsOperationResult<AdminStatisticResponse>> SetStatisticVisibilityAsync(Guid id, bool visible, CancellationToken token);
    Task<CmsOperationResult<IReadOnlyList<AdminStatisticResponse>>> ReorderStatisticsAsync(ReorderHomepageItemsRequest request, CancellationToken token);
    Task<StatisticsPresentationResponse> GetStatisticsPresentationAsync(CancellationToken token);
    Task<CmsOperationResult<StatisticsPresentationResponse>> SaveStatisticsPresentationAsync(SaveStatisticsPresentationRequest request, CancellationToken token);
    Task<IReadOnlyList<AdminPartnerResponse>> GetAdminPartnersAsync(CancellationToken token);
    Task<CmsOperationResult<AdminPartnerResponse>> CreatePartnerAsync(SavePartnerRequest request, CancellationToken token);
    Task<CmsOperationResult<AdminPartnerResponse>> UpdatePartnerAsync(Guid id, SavePartnerRequest request, CancellationToken token);
    Task<CmsOperationResult<AdminPartnerResponse>> SetPartnerVisibilityAsync(Guid id, bool visible, CancellationToken token);
    Task<CmsOperationResult<IReadOnlyList<AdminPartnerResponse>>> ReorderPartnersAsync(ReorderHomepageItemsRequest request, CancellationToken token);
}
