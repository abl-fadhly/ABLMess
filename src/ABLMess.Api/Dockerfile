FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ABLMess.sln ./
COPY src/ABLMess.Api/ABLMess.Api.csproj src/ABLMess.Api/
COPY tests/ABLMess.Api.Tests/ABLMess.Api.Tests.csproj tests/ABLMess.Api.Tests/
RUN dotnet restore src/ABLMess.Api/ABLMess.Api.csproj

COPY src/ABLMess.Api/ src/ABLMess.Api/
RUN dotnet publish src/ABLMess.Api/ABLMess.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app ./

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ABLMess.Api.dll"]
