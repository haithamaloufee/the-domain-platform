namespace TheDomain.Domain.Homepage;

public sealed class StatisticItem
{
    private StatisticItem() { }

    public StatisticItem(Guid id, string label, string value, string? suffix, string? description,
        int sortOrder, bool isVisible, bool isVerified, DateTimeOffset createdAtUtc)
    {
        Id = id;
        Apply(label, value, suffix, description, sortOrder, isVisible, isVerified, createdAtUtc);
        CreatedAtUtc = createdAtUtc;
    }

    public Guid Id { get; private set; }
    public string Label { get; private set; } = string.Empty;
    public string Value { get; private set; } = string.Empty;
    public string? Suffix { get; private set; }
    public string? Description { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsVisible { get; private set; }
    public bool IsVerified { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }

    public void Update(string label, string value, string? suffix, string? description,
        int sortOrder, bool isVisible, bool isVerified, DateTimeOffset updatedAtUtc) =>
        Apply(label, value, suffix, description, sortOrder, isVisible, isVerified, updatedAtUtc);

    public void Show(DateTimeOffset updatedAtUtc) { IsVisible = true; UpdatedAtUtc = updatedAtUtc; }
    public void Hide(DateTimeOffset updatedAtUtc) { IsVisible = false; UpdatedAtUtc = updatedAtUtc; }

    private void Apply(string label, string value, string? suffix, string? description,
        int sortOrder, bool isVisible, bool isVerified, DateTimeOffset updatedAtUtc)
    {
        Label = label; Value = value; Suffix = suffix; Description = description;
        SortOrder = sortOrder; IsVisible = isVisible; IsVerified = isVerified;
        UpdatedAtUtc = updatedAtUtc;
    }
}
