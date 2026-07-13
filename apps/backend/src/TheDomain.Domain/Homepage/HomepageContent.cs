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
