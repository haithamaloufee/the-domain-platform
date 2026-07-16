namespace TheDomain.Domain.About;

public sealed class AboutSettings
{
    public static readonly Guid SingletonId = Guid.Parse("b8fe531e-7d4f-4b50-b3d6-e5de2a69b37e");
    private AboutSettings() { }
    public AboutSettings(DateTimeOffset now) { Id = SingletonId; CreatedAtUtc = UpdatedAtUtc = now; }
    public Guid Id { get; private set; }
    public bool IsPublished { get; private set; }
    public bool IsHeroEnabled { get; private set; } = true;
    public string HeroEyebrow { get; private set; } = "The company";
    public string HeroHeading { get; private set; } = "About The Domain";
    public string HeroText { get; private set; } = "Entertainment composed with intention.";
    public Guid? HeroMediaAssetId { get; private set; }
    public AboutHeroPresentation HeroPresentation { get; private set; } = AboutHeroPresentation.EditorialSplit;
    public string IntroStatement { get; private set; } = "We shape experiences where atmosphere, production, people, and place move as one.";
    public bool IsStoryEnabled { get; private set; } = true;
    public string StoryHeading { get; private set; } = "A considered approach to entertainment.";
    public string StoryText { get; private set; } = "The Domain brings creative direction and operational detail into one clear experience.";
    public string? StoryHighlight { get; private set; }
    public bool IsTeamEnabled { get; private set; } = true;
    public string TeamHeading { get; private set; } = "The people behind the experience.";
    public string TeamText { get; private set; } = "A focused team connecting vision with execution.";
    public bool IsPartnersEnabled { get; private set; } = true;
    public string PartnersHeading { get; private set; } = "Built with trusted partners.";
    public string PartnersText { get; private set; } = "Relationships that strengthen every production.";
    public bool IsReachOutEnabled { get; private set; } = true;
    public string ReachOutHeading { get; private set; } = "Let’s create what comes next.";
    public string ReachOutText { get; private set; } = "Talk to The Domain about your next experience.";
    public string ReachOutCtaLabel { get; private set; } = "Reach out";
    public string ReachOutCtaHref { get; private set; } = "/contact";
    public string? SeoTitle { get; private set; }
    public string? SeoDescription { get; private set; }
    public Guid? SocialImageMediaAssetId { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }

    public void Update(bool isPublished, bool heroEnabled, string heroEyebrow, string heroHeading, string heroText,
        Guid? heroMediaId, AboutHeroPresentation heroPresentation, string introStatement, bool storyEnabled,
        string storyHeading, string storyText, string? storyHighlight, bool teamEnabled, string teamHeading,
        string teamText, bool partnersEnabled, string partnersHeading, string partnersText, bool reachOutEnabled,
        string reachOutHeading, string reachOutText, string reachOutLabel, string reachOutHref,
        string? seoTitle, string? seoDescription, Guid? socialImageId, DateTimeOffset now)
    {
        IsPublished = isPublished; IsHeroEnabled = heroEnabled; HeroEyebrow = heroEyebrow; HeroHeading = heroHeading;
        HeroText = heroText; HeroMediaAssetId = heroMediaId; HeroPresentation = heroPresentation;
        IntroStatement = introStatement; IsStoryEnabled = storyEnabled; StoryHeading = storyHeading; StoryText = storyText;
        StoryHighlight = storyHighlight; IsTeamEnabled = teamEnabled; TeamHeading = teamHeading; TeamText = teamText;
        IsPartnersEnabled = partnersEnabled; PartnersHeading = partnersHeading; PartnersText = partnersText;
        IsReachOutEnabled = reachOutEnabled; ReachOutHeading = reachOutHeading; ReachOutText = reachOutText;
        ReachOutCtaLabel = reachOutLabel; ReachOutCtaHref = reachOutHref; SeoTitle = seoTitle;
        SeoDescription = seoDescription; SocialImageMediaAssetId = socialImageId; UpdatedAtUtc = now;
    }
}
