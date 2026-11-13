using System.ComponentModel.DataAnnotations;
using TheDomain.Domain.Contact;

namespace TheDomain.Application.Contact;

public sealed record SubmitContactRequest(string? Name, string? Email, string? Message, string? Website);
public sealed record ContactMessageResponse(Guid Id, string Name, string Email, string Message, DateTimeOffset CreatedAtUtc, DateTimeOffset? ReadAtUtc);

public interface IContactInbox
{
    Task SubmitAsync(ContactMessage message, CancellationToken cancellationToken);
    Task<IReadOnlyList<ContactMessageResponse>> ListAsync(int offset, CancellationToken cancellationToken);
    Task<bool> MarkReadAsync(Guid id, DateTimeOffset now, CancellationToken cancellationToken);
}

public static class ContactValidation
{
    public static Dictionary<string, string[]> Validate(string name, string email, string message)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.Ordinal);
        if (name.Length is < 2 or > 120) errors["name"] = ["Enter a name between 2 and 120 characters."];
        if (email.Length > 254 || !new EmailAddressAttribute().IsValid(email)) errors["email"] = ["Enter a valid email address."];
        if (message.Length is < 10 or > 3000) errors["message"] = ["Enter a message between 10 and 3000 characters."];
        return errors;
    }
}
