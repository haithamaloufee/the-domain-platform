namespace TheDomain.Domain.Homepage;

public sealed class Partner
{
    private Partner() { }

    public Partner(Guid id, string name, string slug, string? logoUrl, string? websiteUrl,
        string? description, int sortOrder, bool isVisible, bool isFeatured,
        DateTimeOffset createdAtUtc)
    {
        Id = id;
        Apply(name, slug, logoUrl, websiteUrl, description, sortOrder, isVisible, isFeatured, createdAtUtc);
        CreatedAtUtc = createdAtUtc;
    }

    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? LogoUrl { get; private set; }
    public string? WebsiteUrl { get; private set; }
    public string? Description { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsVisible { get; private set; }
    public bool IsFeatured { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }

    public void Update(string name, string slug, string? logoUrl, string? websiteUrl,
        string? description, int sortOrder, bool isVisible, bool isFeatured,
        DateTimeOffset updatedAtUtc) =>
        Apply(name, slug, logoUrl, websiteUrl, description, sortOrder, isVisible, isFeatured, updatedAtUtc);

    public void Show(DateTimeOffset updatedAtUtc) { IsVisible = true; UpdatedAtUtc = updatedAtUtc; }
    public void Hide(DateTimeOffset updatedAtUtc) { IsVisible = false; UpdatedAtUtc = updatedAtUtc; }

    private void Apply(string name, string slug, string? logoUrl, string? websiteUrl,
        string? description, int sortOrder, bool isVisible, bool isFeatured,
        DateTimeOffset updatedAtUtc)
    {
        Name = name; Slug = slug; LogoUrl = logoUrl; WebsiteUrl = websiteUrl;
        Description = description; SortOrder = sortOrder; IsVisible = isVisible;
        IsFeatured = isFeatured; UpdatedAtUtc = updatedAtUtc;
    }
}
