namespace TheDomain.Application.Events;

public sealed record EventOperationResult<T>(T? Value, IReadOnlyList<string> Errors)
{
    public bool IsSuccess => Value is not null && Errors.Count == 0;
}

public static class EventOperationResult
{
    public static EventOperationResult<T> Success<T>(T value) => new(value, []);
    public static EventOperationResult<T> Failure<T>(params string[] errors) => new(default, errors);
}
