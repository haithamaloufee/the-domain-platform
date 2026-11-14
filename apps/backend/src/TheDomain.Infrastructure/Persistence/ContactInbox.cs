using Microsoft.EntityFrameworkCore;
using TheDomain.Application.Contact;
using TheDomain.Domain.Contact;

namespace TheDomain.Infrastructure.Persistence;

public sealed class ContactInbox(TheDomainDbContext database) : IContactInbox
{
    public async Task SubmitAsync(ContactMessage message, CancellationToken cancellationToken)
    {
        database.ContactMessages.Add(message);
        await database.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ContactMessageResponse>> ListAsync(int offset, CancellationToken cancellationToken) =>
        await database.ContactMessages.AsNoTracking().OrderByDescending(message => message.CreatedAtUtc)
            .ThenByDescending(message => message.Id).Skip(offset).Take(25)
            .Select(message => new ContactMessageResponse(message.Id, message.Name, message.Email, message.Message,
                message.CreatedAtUtc, message.ReadAtUtc)).ToListAsync(cancellationToken);

    public async Task<bool> MarkReadAsync(Guid id, DateTimeOffset now, CancellationToken cancellationToken)
    {
        var message = await database.ContactMessages.FindAsync([id], cancellationToken);
        if (message is null) return false;

        message.MarkRead(now);
        await database.SaveChangesAsync(cancellationToken);
        return true;
    }
}
