using TheDomain.Application.About;
using TheDomain.Application.Caching;
using TheDomain.Domain.About;
using TheDomain.Domain.Homepage;
using TheDomain.Domain.Media;

namespace TheDomain.Application.Tests.About;

public sealed class AboutServiceTests
{
    [Fact] public async Task AboutMutationEvictsAboutTag()
    { var repo=new FakeRepository();var cache=new RecordingInvalidator();Assert.True((await new AboutService(repo,TimeProvider.System,null,cache).SaveSettingsAsync(Settings(),default)).IsSuccess);Assert.Equal([PublicCacheTags.About],Assert.Single(cache.Calls)); }
    [Fact] public async Task FirstAndRepeatedSaveUseOneSingleton()
    { var repo=new FakeRepository();var service=new AboutService(repo,TimeProvider.System); Assert.True((await service.SaveSettingsAsync(Settings(),default)).IsSuccess); Assert.True((await service.SaveSettingsAsync(Settings() with { IsStoryEnabled=false },default)).IsSuccess); Assert.Equal(1,repo.AddSettingsCount);Assert.False(repo.Settings!.IsStoryEnabled);Assert.Equal(2,repo.SaveCount); }
    [Fact] public async Task InvalidPresetIsRejected()
    { var service=new AboutService(new FakeRepository(),TimeProvider.System);var result=await service.SaveSettingsAsync(Settings() with { HeroPresentation=(AboutHeroPresentation)99 },default);Assert.False(result.IsSuccess);Assert.Single(result.Errors); }
    [Fact] public async Task HeroAllowsApprovedVideoButSocialImageRejectsVideo()
    { var video=Media(MediaType.Video,MediaApprovalStatus.Approved);var repo=new FakeRepository{Media=[video]};var service=new AboutService(repo,TimeProvider.System);Assert.True((await service.SaveSettingsAsync(Settings() with { HeroMediaAssetId=video.Id },default)).IsSuccess);Assert.False((await service.SaveSettingsAsync(Settings() with { SocialImageMediaAssetId=video.Id },default)).IsSuccess); }
    [Fact] public async Task TeamPhotoMustBeEligibleImage()
    { var draft=Media(MediaType.Image,MediaApprovalStatus.Draft);var video=Media(MediaType.Video,MediaApprovalStatus.Approved);var repo=new FakeRepository{Media=[draft,video]};var service=new AboutService(repo,TimeProvider.System);Assert.False((await service.CreateTeamMemberAsync(Member(draft.Id),default)).IsSuccess);Assert.False((await service.CreateTeamMemberAsync(Member(video.Id),default)).IsSuccess); }
    [Fact] public async Task TeamCreateUpdateVisibilityAndDeletePreserveMedia()
    { var photo=Media(MediaType.Image,MediaApprovalStatus.Approved);var repo=new FakeRepository{Media=[photo]};var service=new AboutService(repo,TimeProvider.System);var created=await service.CreateTeamMemberAsync(Member(photo.Id),default);Assert.True(created.IsSuccess);var id=created.Value!.Id;Assert.True((await service.UpdateTeamMemberAsync(id,Member(photo.Id) with{Name="Updated"},default)).IsSuccess);Assert.False((await service.SetTeamVisibilityAsync(id,false,default)).Value!.IsVisible);Assert.True((await service.DeleteTeamMemberAsync(id,default)).IsSuccess);Assert.Contains(photo,repo.Media); }
    [Fact] public async Task TeamReorderRequiresEveryUniqueId()
    { var photo=Media(MediaType.Image,MediaApprovalStatus.Approved);var repo=new FakeRepository{Media=[photo]};var service=new AboutService(repo,TimeProvider.System);var a=(await service.CreateTeamMemberAsync(Member(photo.Id),default)).Value!;var b=(await service.CreateTeamMemberAsync(Member(photo.Id) with{Name="B"},default)).Value!;Assert.False((await service.ReorderTeamAsync(new([a.Id,a.Id]),default)).IsSuccess);Assert.True((await service.ReorderTeamAsync(new([b.Id,a.Id]),default)).IsSuccess); }
    [Fact] public async Task PublicProjectionFiltersHiddenTeamAndPartners()
    { var photo=Media(MediaType.Image,MediaApprovalStatus.Approved);var repo=new FakeRepository{Media=[photo],Settings=new AboutSettings(DateTimeOffset.UtcNow),Partners=[Partner("shown",true),Partner("hidden",false)]};repo.Settings.Update(true,true,null,AboutHeroPresentation.EditorialSplit,true,true,true,true,null,DateTimeOffset.UtcNow);var service=new AboutService(repo,TimeProvider.System);await service.CreateTeamMemberAsync(Member(photo.Id),default);await service.CreateTeamMemberAsync(Member(photo.Id) with{Name="Hidden",IsVisible=false},default);var result=await service.GetPublicAboutAsync(default);Assert.Single(result.Team);Assert.Single(result.Partners);Assert.Equal("shown",result.Partners[0].Slug); }
    private static SaveAboutSettingsRequest Settings()=>new(true,true,null,AboutHeroPresentation.EditorialSplit,true,true,true,true,null);
    private static SaveTeamMemberRequest Member(Guid photo)=>new("Name","Role",null,photo,"https://example.com/profile",true);
    private static MediaAsset Media(MediaType type,MediaApprovalStatus status)=>new(Guid.NewGuid(),"media","media",type,$"https://cdn.example/{Guid.NewGuid()}",null,100,100,type==MediaType.Video?10:null,MediaOrientation.Landscape,null,null,"Alt",status,null,DateTimeOffset.UtcNow);
    private static Partner Partner(string slug,bool visible)=>new(Guid.NewGuid(),slug,slug,null,null,null,0,visible,false,DateTimeOffset.UtcNow);
    private sealed class RecordingInvalidator:IPublicOutputCacheInvalidator{public List<string[]> Calls{get;}=[];public Task EvictAsync(CancellationToken token,params string[] tags){Calls.Add(tags);return Task.CompletedTask;}}
    private sealed class FakeRepository:IAboutRepository
    { public AboutSettings? Settings{get;set;} public List<MediaAsset> Media{get;init;}=[];public List<TeamMember> Team{get;init;}=[];public IReadOnlyList<Partner> Partners{get;init;}=[];public int AddSettingsCount{get;private set;}public int SaveCount{get;private set;}public Task<AboutSettings?> GetSettingsAsync(CancellationToken token)=>Task.FromResult(Settings);public Task<IReadOnlyList<TeamMember>> ListTeamAsync(CancellationToken token)=>Task.FromResult<IReadOnlyList<TeamMember>>(Team);public Task<TeamMember?> FindTeamMemberAsync(Guid id,CancellationToken token)=>Task.FromResult(Team.SingleOrDefault(x=>x.Id==id));public Task<MediaAsset?> FindMediaAsync(Guid id,CancellationToken token)=>Task.FromResult(Media.SingleOrDefault(x=>x.Id==id));public Task<IReadOnlyDictionary<Guid,MediaAsset>> ListMediaAsync(IReadOnlyCollection<Guid> ids,CancellationToken token)=>Task.FromResult<IReadOnlyDictionary<Guid,MediaAsset>>(Media.Where(x=>ids.Contains(x.Id)).ToDictionary(x=>x.Id));public Task<IReadOnlyList<Partner>> ListPartnersAsync(CancellationToken token)=>Task.FromResult(Partners);public void AddSettings(AboutSettings settings){Settings=settings;AddSettingsCount++;}public void AddTeamMember(TeamMember member)=>Team.Add(member);public void RemoveTeamMember(TeamMember member)=>Team.Remove(member);public Task SaveChangesAsync(CancellationToken token){SaveCount++;return Task.CompletedTask;} }
}
