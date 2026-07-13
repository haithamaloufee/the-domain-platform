using System.Globalization;
using Serilog;
using TheDomain.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()
    .WriteTo.Console(formatProvider: CultureInfo.InvariantCulture));

builder.Services.AddApiFoundation(builder.Configuration, builder.Environment);

var app = builder.Build();

app.UseApiFoundation();
app.MapApiEndpoints();

app.Run();

public partial class Program;
