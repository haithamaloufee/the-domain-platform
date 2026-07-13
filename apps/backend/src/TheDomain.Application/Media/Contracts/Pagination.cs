namespace TheDomain.Application.Media.Contracts;

public sealed record PagedResponse<T>(int PageNumber, int PageSize, int TotalCount, int TotalPages, bool HasNextPage, bool HasPreviousPage, IReadOnlyList<T> Items);
public sealed record MediaListQuery(int PageNumber = 1, int PageSize = 20, string? MediaType = null, string? ApprovalStatus = null, string? Category = null, string? Orientation = null, Guid? EventId = null, string? Usage = null, string? Search = null);
