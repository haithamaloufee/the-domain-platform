namespace TheDomain.Domain.Homepage;

public sealed class HomepageContent
{
    public static readonly Guid SingletonId = Guid.Parse("6f44ac8f-0cc7-4caf-988d-5e666469f48e");

    private HomepageContent() { }

    public HomepageContent(Guid id, string heroEyebrow, string heroTitle, string? heroAccent,
        string heroDescription, string primaryCtaLabel, string primaryCtaHref,
        string? secondaryCtaLabel, string? secondaryCtaHref, string whyTitle,
        string whyDescription, string servicesTitle, string servicesDescription,
        string partnersTitle, string partnersDescription, string contactTitle,
        string contactDescription, string contactCtaLabel, string contactCtaHref,
        bool isPublished, DateTimeOffset createdAtUtc)
    {
        if (id != SingletonId) throw new ArgumentException("Homepage content must use the singleton identifier.", nameof(id));
        Id = id;
        Apply(heroEyebrow, heroTitle, heroAccent, heroDescription, primaryCtaLabel, primaryCtaHref,
            secondaryCtaLabel, secondaryCtaHref, whyTitle, whyDescription, servicesTitle,
            servicesDescription, partnersTitle, partnersDescription, contactTitle, contactDescription,
            contactCtaLabel, contactCtaHref, isPublished, createdAtUtc);
        CreatedAtUtc = createdAtUtc;
    }

    public Guid Id { get; private set; }
    public string HeroEyebrow { get; private set; } = string.Empty;
    public string HeroTitle { get; private set; } = string.Empty;
    public string? HeroAccent { get; private set; }
    public string HeroDescription { get; private set; } = string.Empty;
    public string PrimaryCtaLabel { get; private set; } = string.Empty;
    public string PrimaryCtaHref { get; private set; } = string.Empty;
    public string? SecondaryCtaLabel { get; private set; }
    public string? SecondaryCtaHref { get; private set; }
    public string WhyTitle { get; private set; } = string.Empty;
    public string WhyDescription { get; private set; } = string.Empty;
    public string ServicesTitle { get; private set; } = string.Empty;
    public string ServicesDescription { get; private set; } = string.Empty;
    public string PartnersTitle { get; private set; } = string.Empty;
    public string PartnersDescription { get; private set; } = string.Empty;
    public string ContactTitle { get; private set; } = string.Empty;
    public string ContactDescription { get; private set; } = string.Empty;
    public string ContactCtaLabel { get; private set; } = string.Empty;
    public string ContactCtaHref { get; private set; } = string.Empty;
    public bool IsPublished { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }
    public string StatisticsPhrase { get; private set; } = "Moments that move with us";
    public bool IsStatisticsPhraseEnabled { get; private set; } = true;
    public Guid? HeroMediaAssetId { get; private set; }
    public Guid? GalleryCollectionId { get; private set; }
    public bool IsFloatingVideoEnabled { get; private set; }
    public Guid? FloatingVideoMediaAssetId { get; private set; }
    public Guid? FloatingVideoPosterMediaAssetId { get; private set; }
    public string SectionOrder { get; private set; } = "events,statistics,why,previous,gallery,services,partners,contact";
    public string DisabledSections { get; private set; } = string.Empty;
    public string EventsTitle { get; private set; } = "Upcoming experiences";
    public string EventsDescription { get; private set; } = "The next Domain experiences.";
    public string PreviousEventsTitle { get; private set; } = "Previous events";
    public string PreviousEventsDescription { get; private set; } = "Moments that continue to shape The Domain.";
    public string GalleryTitle { get; private set; } = "Gallery highlights";
    public string GalleryDescription { get; private set; } = "Curated photography and film from The Domain.";
    public void UpdateStatisticsPresentation(string phrase, bool enabled, DateTimeOffset now) { var value = phrase?.Trim() ?? string.Empty; if (value.Length is < 1 or > 180) throw new ArgumentException("Statistics phrase must be between 1 and 180 characters.", nameof(phrase)); StatisticsPhrase = value; IsStatisticsPhraseEnabled = enabled; UpdatedAtUtc = now; }
    public void UpdateBuilder(Guid? heroMediaAssetId, Guid? galleryCollectionId,
        bool isFloatingVideoEnabled, Guid? floatingVideoMediaAssetId,
        Guid? floatingVideoPosterMediaAssetId, string sectionOrder, string disabledSections,
        string eventsTitle, string eventsDescription, string previousTitle,
        string previousDescription, string galleryTitle, string galleryDescription,
        DateTimeOffset now)
    {
        HeroMediaAssetId = heroMediaAssetId;
        GalleryCollectionId = galleryCollectionId;
        IsFloatingVideoEnabled = isFloatingVideoEnabled;
        FloatingVideoMediaAssetId = floatingVideoMediaAssetId;
        FloatingVideoPosterMediaAssetId = floatingVideoPosterMediaAssetId;
        SectionOrder = sectionOrder;
        DisabledSections = disabledSections;
        EventsTitle = eventsTitle.Trim();
        EventsDescription = eventsDescription.Trim();
        PreviousEventsTitle = previousTitle.Trim();
        PreviousEventsDescription = previousDescription.Trim();
        GalleryTitle = galleryTitle.Trim();
        GalleryDescription = galleryDescription.Trim();
        UpdatedAtUtc = now;
    }

    public void Update(string heroEyebrow, string heroTitle, string? heroAccent,
        string heroDescription, string primaryCtaLabel, string primaryCtaHref,
        string? secondaryCtaLabel, string? secondaryCtaHref, string whyTitle,
        string whyDescription, string servicesTitle, string servicesDescription,
        string partnersTitle, string partnersDescription, string contactTitle,
        string contactDescription, string contactCtaLabel, string contactCtaHref,
        bool isPublished, DateTimeOffset updatedAtUtc) =>
        Apply(heroEyebrow, heroTitle, heroAccent, heroDescription, primaryCtaLabel, primaryCtaHref,
            secondaryCtaLabel, secondaryCtaHref, whyTitle, whyDescription, servicesTitle,
            servicesDescription, partnersTitle, partnersDescription, contactTitle, contactDescription,
            contactCtaLabel, contactCtaHref, isPublished, updatedAtUtc);

    private void Apply(string heroEyebrow, string heroTitle, string? heroAccent,
        string heroDescription, string primaryCtaLabel, string primaryCtaHref,
        string? secondaryCtaLabel, string? secondaryCtaHref, string whyTitle,
        string whyDescription, string servicesTitle, string servicesDescription,
        string partnersTitle, string partnersDescription, string contactTitle,
        string contactDescription, string contactCtaLabel, string contactCtaHref,
        bool isPublished, DateTimeOffset updatedAtUtc)
    {
        HeroEyebrow = heroEyebrow; HeroTitle = heroTitle; HeroAccent = heroAccent;
        HeroDescription = heroDescription; PrimaryCtaLabel = primaryCtaLabel;
        PrimaryCtaHref = primaryCtaHref; SecondaryCtaLabel = secondaryCtaLabel;
        SecondaryCtaHref = secondaryCtaHref; WhyTitle = whyTitle; WhyDescription = whyDescription;
        ServicesTitle = servicesTitle; ServicesDescription = servicesDescription;
        PartnersTitle = partnersTitle; PartnersDescription = partnersDescription;
        ContactTitle = contactTitle; ContactDescription = contactDescription;
        ContactCtaLabel = contactCtaLabel; ContactCtaHref = contactCtaHref;
        IsPublished = isPublished; UpdatedAtUtc = updatedAtUtc;
    }
}
