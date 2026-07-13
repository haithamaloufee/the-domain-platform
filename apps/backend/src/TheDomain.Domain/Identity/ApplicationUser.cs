namespace TheDomain.Domain.Identity;

public sealed class ApplicationUser
{
    private readonly List<RefreshToken> _refreshTokens = [];

    private ApplicationUser()
    {
    }

    public ApplicationUser(
        Guid id,
        string fullName,
        string email,
        string normalizedEmail,
        string passwordHash,
        UserRole role,
        DateTimeOffset createdAtUtc)
    {
        Id = id;
        FullName = fullName;
        Email = email;
        NormalizedEmail = normalizedEmail;
        PasswordHash = passwordHash;
        Role = role;
        IsActive = true;
        CreatedAtUtc = createdAtUtc;
        UpdatedAtUtc = createdAtUtc;
    }

    public Guid Id { get; private set; }
    public string FullName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string NormalizedEmail { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public UserRole Role { get; private set; }
    public bool IsActive { get; private set; }
    public DateTimeOffset? LastLoginAtUtc { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }
    public IReadOnlyCollection<RefreshToken> RefreshTokens => _refreshTokens;

    public void RecordLogin(DateTimeOffset timestamp)
    {
        LastLoginAtUtc = timestamp;
        UpdatedAtUtc = timestamp;
    }

    public void AddRefreshToken(RefreshToken refreshToken)
    {
        ArgumentNullException.ThrowIfNull(refreshToken);
        refreshToken.AttachTo(this);
        _refreshTokens.Add(refreshToken);
    }
}
