using System.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using TheDomain.Application.Authentication;
using TheDomain.Application.Common;
using TheDomain.Domain.Identity;

namespace TheDomain.Infrastructure.Persistence;

public sealed class UserDirectory(TheDomainDbContext database, IPasswordHasher hasher, TimeProvider clock) : IUserDirectory
{
    public async Task<IReadOnlyList<UserDirectoryEntry>> ListAsync(int offset, CancellationToken cancellationToken) =>
        await database.Users.AsNoTracking().OrderBy(user => user.NormalizedEmail).Skip(offset).Take(50)
            .Select(user => new UserDirectoryEntry(user.Id, user.FullName, user.Email, user.Role, user.IsActive))
            .ToListAsync(cancellationToken);

    public async Task<UserDirectoryResult> CreateAsync(CreateManagedUser request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim();
        var now = clock.GetUtcNow();
        var user = new ApplicationUser(Guid.NewGuid(), request.FullName.Trim(), email, EmailNormalizer.Normalize(email),
            "", request.Role, now);
        user.ResetPassword(hasher.HashPassword(user, request.Password), now);
        database.Users.Add(user);
        return await SaveAsync(cancellationToken);
    }

    public async Task<UserDirectoryResult> UpdateAsync(Guid id, Guid actorId, UpdateManagedUser request, CancellationToken cancellationToken)
    {
        await using var transaction = await database.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
        var user = await database.Users.Include(user => user.RefreshTokens).SingleOrDefaultAsync(user => user.Id == id, cancellationToken);
        if (user is null) return UserDirectoryResult.NotFound;
        if (id == actorId && (!request.IsActive || request.Role != UserRole.SuperAdmin))
            return UserDirectoryResult.Conflict;

        if (user.IsActive && user.Role == UserRole.SuperAdmin &&
            (!request.IsActive || request.Role != UserRole.SuperAdmin) &&
            !await database.Users.AnyAsync(other => other.Id != id && other.IsActive && other.Role == UserRole.SuperAdmin, cancellationToken))
            return UserDirectoryResult.Conflict;

        user.UpdateAccess(request.Role, request.IsActive, clock.GetUtcNow());
        var result = await SaveAsync(cancellationToken);
        if (result != UserDirectoryResult.Saved) return result;
        try
        {
            await transaction.CommitAsync(cancellationToken);
            return result;
        }
        catch (PostgresException exception) when (exception.SqlState == PostgresErrorCodes.SerializationFailure)
        {
            return UserDirectoryResult.Conflict;
        }
    }

    private async Task<UserDirectoryResult> SaveAsync(CancellationToken cancellationToken)
    {
        try
        {
            await database.SaveChangesAsync(cancellationToken);
            return UserDirectoryResult.Saved;
        }
        catch (DbUpdateConcurrencyException)
        {
            return UserDirectoryResult.Conflict;
        }
        catch (DbUpdateException exception) when (exception.InnerException is PostgresException postgres &&
            postgres.SqlState is PostgresErrorCodes.UniqueViolation or PostgresErrorCodes.SerializationFailure)
        {
            return UserDirectoryResult.Conflict;
        }
    }
}
