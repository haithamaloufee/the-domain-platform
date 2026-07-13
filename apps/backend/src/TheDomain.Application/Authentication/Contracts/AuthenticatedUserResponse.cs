using TheDomain.Domain.Identity;

namespace TheDomain.Application.Authentication.Contracts;

public sealed record AuthenticatedUserResponse(
    Guid Id,
    string FullName,
    string Email,
    UserRole Role);
