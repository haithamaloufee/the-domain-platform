using TheDomain.Application.Homepage.Contracts;

namespace TheDomain.Application.Homepage;

public sealed class DisabledHomepageCmsService : IHomepageCmsService
{
    private static readonly IReadOnlyList<PublicStatisticResponse> NoPublicStatistics = [];
    private static readonly IReadOnlyList<PublicPartnerResponse> NoPublicPartners = [];
    private static readonly IReadOnlyList<AdminStatisticResponse> NoAdminStatistics = [];
    private static readonly IReadOnlyList<AdminPartnerResponse> NoAdminPartners = [];
    public Task<PublicHomepageResponse> GetPublicHomepageAsync(CancellationToken token) => Task.FromResult(
        new PublicHomepageResponse(new(null, null, true), [], [], [], null, NoPublicPartners));
    public Task<IReadOnlyList<PublicStatisticResponse>> GetPublicStatisticsAsync(CancellationToken token) => Task.FromResult(NoPublicStatistics);
    public Task<IReadOnlyList<PublicPartnerResponse>> GetPublicPartnersAsync(CancellationToken token) => Task.FromResult(NoPublicPartners);
    public Task<AdminHomepageContentResponse?> GetAdminHomepageAsync(CancellationToken token) => Task.FromResult<AdminHomepageContentResponse?>(null);
    public Task<CmsOperationResult<AdminHomepageContentResponse>> UpdateHomepageAsync(UpdateHomepageContentRequest request, CancellationToken token) => Disabled<AdminHomepageContentResponse>();
    public Task<IReadOnlyList<AdminStatisticResponse>> GetAdminStatisticsAsync(CancellationToken token) => Task.FromResult(NoAdminStatistics);
    public Task<CmsOperationResult<AdminStatisticResponse>> CreateStatisticAsync(SaveStatisticRequest request, CancellationToken token) => Disabled<AdminStatisticResponse>();
    public Task<CmsOperationResult<AdminStatisticResponse>> UpdateStatisticAsync(Guid id, SaveStatisticRequest request, CancellationToken token) => Disabled<AdminStatisticResponse>();
    public Task<CmsOperationResult<AdminStatisticResponse>> SetStatisticVisibilityAsync(Guid id, bool visible, CancellationToken token) => Disabled<AdminStatisticResponse>();
    public Task<CmsOperationResult<IReadOnlyList<AdminStatisticResponse>>> ReorderStatisticsAsync(ReorderHomepageItemsRequest request, CancellationToken token) => Disabled<IReadOnlyList<AdminStatisticResponse>>();
    public Task<StatisticsPresentationResponse> GetStatisticsPresentationAsync(CancellationToken token) => Task.FromResult(new StatisticsPresentationResponse(true));
    public Task<CmsOperationResult<StatisticsPresentationResponse>> SaveStatisticsPresentationAsync(SaveStatisticsPresentationRequest request, CancellationToken token) => Disabled<StatisticsPresentationResponse>();
    public Task<IReadOnlyList<AdminPartnerResponse>> GetAdminPartnersAsync(CancellationToken token) => Task.FromResult(NoAdminPartners);
    public Task<CmsOperationResult<AdminPartnerResponse>> CreatePartnerAsync(SavePartnerRequest request, CancellationToken token) => Disabled<AdminPartnerResponse>();
    public Task<CmsOperationResult<AdminPartnerResponse>> UpdatePartnerAsync(Guid id, SavePartnerRequest request, CancellationToken token) => Disabled<AdminPartnerResponse>();
    public Task<CmsOperationResult<AdminPartnerResponse>> SetPartnerVisibilityAsync(Guid id, bool visible, CancellationToken token) => Disabled<AdminPartnerResponse>();
    public Task<CmsOperationResult<IReadOnlyList<AdminPartnerResponse>>> ReorderPartnersAsync(ReorderHomepageItemsRequest request, CancellationToken token) => Disabled<IReadOnlyList<AdminPartnerResponse>>();
    private static Task<CmsOperationResult<T>> Disabled<T>() => Task.FromResult(
        CmsOperationResult.Failure<T>(CmsFailureKind.Conflict, "Persistence is not enabled."));
}
