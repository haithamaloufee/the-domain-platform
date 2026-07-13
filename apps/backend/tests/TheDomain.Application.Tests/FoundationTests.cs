namespace TheDomain.Application.Tests;

public sealed class FoundationTests
{
    [Fact]
    public void ApplicationAssemblyIsAvailable()
    {
        Assert.NotNull(typeof(DependencyInjection).Assembly);
    }
}
