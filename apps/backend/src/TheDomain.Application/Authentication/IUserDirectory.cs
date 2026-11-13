using TheDomain.Domain.Identity;

namespace TheDomain.Application.Authentication;

public sealed record UserDirectoryEntry(Guid Id, string FullName, string Email, UserRole Role, bool IsActive);
public sealed record CreateManagedUser(string FullName, string Email, string Password, UserRole Role);
public sealed record UpdateManagedUser(UserRole Role, bool IsActive);

public enum UserDirectoryResult { Saved, NotFound, Conflict }

public interface IUserDirectory
{
    Task<IReadOnlyList<UserDirectoryEntry>> ListAsync(int offset, CancellationToken cancellationToken);
    Task<UserDirectoryResult> CreateAsync(CreateManagedUser request, CancellationToken cancellationToken);
    Task<UserDirectoryResult> UpdateAsync(Guid id, Guid actorId, UpdateManagedUser request, CancellationToken cancellationToken);
}
