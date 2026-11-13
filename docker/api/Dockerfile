FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source
COPY apps/backend/ ./
RUN dotnet publish src/TheDomain.Api/TheDomain.Api.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /out/ ./
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
USER $APP_UID
ENTRYPOINT ["dotnet", "TheDomain.Api.dll"]
