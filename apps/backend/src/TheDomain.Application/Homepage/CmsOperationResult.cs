namespace TheDomain.Application.Homepage;

public enum CmsFailureKind
{
    Validation,
    NotFound,
    Conflict
}

public sealed record CmsOperationResult<T>(T? Value, IReadOnlyList<string> Errors, CmsFailureKind? FailureKind)
{
    public bool IsSuccess => Value is not null && Errors.Count == 0 && FailureKind is null;
}

public static class CmsOperationResult
{
    public static CmsOperationResult<T> Success<T>(T value) => new(value, [], null);
    public static CmsOperationResult<T> Failure<T>(CmsFailureKind kind, params string[] errors) =>
        new(default, errors, kind);
}
