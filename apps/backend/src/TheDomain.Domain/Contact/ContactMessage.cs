namespace TheDomain.Domain.Contact;

public sealed class ContactMessage
{
    private ContactMessage() { }

    public ContactMessage(Guid id, string name, string email, string message, DateTimeOffset createdAtUtc)
    {
        Id = id;
        Name = name;
        Email = email;
        Message = message;
        CreatedAtUtc = createdAtUtc;
    }

    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset? ReadAtUtc { get; private set; }

    public void MarkRead(DateTimeOffset now) => ReadAtUtc ??= now;
}
