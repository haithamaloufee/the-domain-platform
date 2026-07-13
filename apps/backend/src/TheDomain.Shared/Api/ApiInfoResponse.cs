namespace TheDomain.SharedKernel.Api;

public sealed record ApiInfoResponse(
    string ApplicationName,
    string Environment,
    string Version,
    DateTimeOffset Timestamp);
