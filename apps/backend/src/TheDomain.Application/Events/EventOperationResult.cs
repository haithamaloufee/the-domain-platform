namespace TheDomain.Application.Events;

public enum EventFailureKind { Validation = 1, NotFound = 2, Conflict = 3 }

public sealed record EventOperationResult<T>(T? Value, IReadOnlyList<string> Errors, EventFailureKind FailureKind = EventFailureKind.Validation)
{
    public bool IsSuccess => Value is not null && Errors.Count == 0;
}

public static class EventOperationResult
{
    public static EventOperationResult<T> Success<T>(T value) => new(value, []);
    public static EventOperationResult<T> Failure<T>(params string[] errors) => new(default, errors);
    public static EventOperationResult<T> NotFound<T>(string error) => new(default, [error], EventFailureKind.NotFound);
    public static EventOperationResult<T> Conflict<T>(string error) => new(default, [error], EventFailureKind.Conflict);
}
