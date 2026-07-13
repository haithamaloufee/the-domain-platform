using TheDomain.Application.Homepage.Contracts;

namespace TheDomain.Application.Homepage;

public sealed class DisabledHomepageCmsService : IHomepageCmsService
{
    private static readonly IReadOnlyList<PublicStatisticResponse> NoPublicStatistics = [];
    private static readonly IReadOnlyList<PublicPartnerResponse> NoPublicPartners = [];
    private static readonly IReadOnlyList<AdminStatisticResponse> NoAdminStatistics = [];
    private static readonly IReadOnlyList<AdminPartnerResponse> NoAdminPartners = [];

    public Task<PublicHomepageResponse> GetPublicHomepageAsync(CancellationToken cancellationToken) =>
        Task.FromResult(new PublicHomepageResponse(null, NoPublicStatistics, NoPublicPartners));
    public Task<IReadOnlyList<PublicStatisticResponse>> GetPublicStatisticsAsync(CancellationToken cancellationToken) => Task.FromResult(NoPublicStatistics);
    public Task<IReadOnlyList<PublicPartnerResponse>> GetPublicPartnersAsync(CancellationToken cancellationToken) => Task.FromResult(NoPublicPartners);
    public Task<AdminHomepageContentResponse?> GetAdminHomepageAsync(CancellationToken cancellationToken) => Task.FromResult<AdminHomepageContentResponse?>(null);
    public Task<CmsOperationResult<AdminHomepageContentResponse>> UpdateHomepageAsync(UpdateHomepageContentRequest request, CancellationToken cancellationToken) => Disabled<AdminHomepageContentResponse>();
    public Task<IReadOnlyList<AdminStatisticResponse>> GetAdminStatisticsAsync(CancellationToken cancellationToken) => Task.FromResult(NoAdminStatistics);
    public Task<CmsOperationResult<AdminStatisticResponse>> CreateStatisticAsync(SaveStatisticRequest request, CancellationToken cancellationToken) => Disabled<AdminStatisticResponse>();
    public Task<CmsOperationResult<AdminStatisticResponse>> UpdateStatisticAsync(Guid id, SaveStatisticRequest request, CancellationToken cancellationToken) => Disabled<AdminStatisticResponse>();
    public Task<CmsOperationResult<AdminStatisticResponse>> SetStatisticVisibilityAsync(Guid id, bool visible, CancellationToken cancellationToken) => Disabled<AdminStatisticResponse>();
    public Task<IReadOnlyList<AdminPartnerResponse>> GetAdminPartnersAsync(CancellationToken cancellationToken) => Task.FromResult(NoAdminPartners);
    public Task<CmsOperationResult<AdminPartnerResponse>> CreatePartnerAsync(SavePartnerRequest request, CancellationToken cancellationToken) => Disabled<AdminPartnerResponse>();
    public Task<CmsOperationResult<AdminPartnerResponse>> UpdatePartnerAsync(Guid id, SavePartnerRequest request, CancellationToken cancellationToken) => Disabled<AdminPartnerResponse>();
    public Task<CmsOperationResult<AdminPartnerResponse>> SetPartnerVisibilityAsync(Guid id, bool visible, CancellationToken cancellationToken) => Disabled<AdminPartnerResponse>();

    private static Task<CmsOperationResult<T>> Disabled<T>() => Task.FromResult(
        CmsOperationResult.Failure<T>(CmsFailureKind.Conflict, "Persistence is not enabled."));
}
