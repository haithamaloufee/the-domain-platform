namespace TheDomain.Domain.About;

public sealed class TeamMember
{
    private TeamMember() { }
    public TeamMember(Guid id, string name, string role, string? biography, Guid photoMediaAssetId,
        string? profileUrl, bool isVisible, int sortOrder, DateTimeOffset now)
    { Id = id; Update(name, role, biography, photoMediaAssetId, profileUrl, isVisible, sortOrder, now); CreatedAtUtc = now; }
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Role { get; private set; } = string.Empty;
    public string? Biography { get; private set; }
    public Guid PhotoMediaAssetId { get; private set; }
    public string? ProfileUrl { get; private set; }
    public bool IsVisible { get; private set; }
    public int SortOrder { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }
    public void Update(string name, string role, string? biography, Guid photoId, string? profileUrl, bool visible, int order, DateTimeOffset now)
    { Name = name; Role = role; Biography = biography; PhotoMediaAssetId = photoId; ProfileUrl = profileUrl; IsVisible = visible; SortOrder = order; UpdatedAtUtc = now; }
    public void SetVisibility(bool visible, DateTimeOffset now) { IsVisible = visible; UpdatedAtUtc = now; }
    public void SetSortOrder(int order, DateTimeOffset now) { SortOrder = order; UpdatedAtUtc = now; }
}
