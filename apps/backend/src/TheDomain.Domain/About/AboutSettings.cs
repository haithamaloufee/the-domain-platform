namespace TheDomain.Domain.About;

public sealed class AboutSettings
{
    public static readonly Guid SingletonId = Guid.Parse("b8fe531e-7d4f-4b50-b3d6-e5de2a69b37e");
    private AboutSettings() { }
    public AboutSettings(DateTimeOffset now) { Id = SingletonId; CreatedAtUtc = UpdatedAtUtc = now; }

    public Guid Id { get; private set; }
    public bool IsPublished { get; private set; }
    public bool IsHeroEnabled { get; private set; } = true;
    public Guid? HeroMediaAssetId { get; private set; }
    public AboutHeroPresentation HeroPresentation { get; private set; } = AboutHeroPresentation.EditorialSplit;
    public bool IsStoryEnabled { get; private set; } = true;
    public bool IsTeamEnabled { get; private set; } = true;
    public bool IsPartnersEnabled { get; private set; } = true;
    public bool IsReachOutEnabled { get; private set; } = true;
    public Guid? SocialImageMediaAssetId { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }

    public void Update(bool isPublished, bool heroEnabled, Guid? heroMediaId,
        AboutHeroPresentation heroPresentation, bool storyEnabled, bool teamEnabled,
        bool partnersEnabled, bool reachOutEnabled, Guid? socialImageId, DateTimeOffset now)
    {
        IsPublished = isPublished;
        IsHeroEnabled = heroEnabled;
        HeroMediaAssetId = heroMediaId;
        HeroPresentation = heroPresentation;
        IsStoryEnabled = storyEnabled;
        IsTeamEnabled = teamEnabled;
        IsPartnersEnabled = partnersEnabled;
        IsReachOutEnabled = reachOutEnabled;
        SocialImageMediaAssetId = socialImageId;
        UpdatedAtUtc = now;
    }
}
