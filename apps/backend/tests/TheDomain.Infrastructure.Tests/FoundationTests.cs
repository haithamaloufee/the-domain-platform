namespace TheDomain.Infrastructure.Tests;

public sealed class FoundationTests
{
    [Fact]
    public void InfrastructureAssemblyIsAvailable()
    {
        Assert.NotNull(typeof(DependencyInjection).Assembly);
    }
}
