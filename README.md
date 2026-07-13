# ABLMess

Web application for GS admin to manage mess (crew lodging) for crew — booking rooms/beds, tracking room and crew history, and logging outside-hotel placements when mess rooms are full.

See [REQUIREMENTS.md](REQUIREMENTS.md) for the full functional spec (roles, entities, business rules).

## Status

Backend API is functional: auth, booking flow, reference-data management, dashboard, and email notifications are implemented and covered by tests. No frontend yet.

## Roles

- **Admin** — full access.
- **GS** — books rooms/beds for crew requests, manages users/rooms/locations/ships/Jabatan, views dashboard and logs, records outside-hotel placements.
- **Crew** — requests a room, views own history, manages own profile/password.

## Tech stack

- **Backend**: .NET 9 (C#), ASP.NET Core Web API, Entity Framework Core
- **Database**: PostgreSQL
- **Auth**: JWT bearer tokens, role-based authorization (Admin/GS/Crew)
- **Tests**: xUnit + EF Core InMemory provider

## Project structure

```
src/ABLMess.Api/       ASP.NET Core Web API
  Models/               EF Core entities + enums
  Data/                 DbContext, seed data
  Migrations/           EF Core migrations
  Auth/                 JWT token issuing
  BookingLogic/         Bed-overlap check, room status computation
  Notifications/        Email sending + reminder background job
  Controllers/          API endpoints
  Dtos/                 Request/response models
tests/ABLMess.Api.Tests/  xUnit tests (booking logic, request lifecycle)
```

## Running locally (Docker)

The easiest way to run the whole stack (API + Postgres) is Docker Compose:

```
docker compose up -d --build
```

This will:
- Start Postgres and wait for it to be healthy
- Build and start the API on `http://localhost:8080`
- Apply EF Core migrations automatically on startup
- Seed a default Admin account if the `Users` table is empty

### Trying it out in the browser (Swagger UI)

Open **http://localhost:8080/swagger** to see and call every endpoint interactively. To test protected routes: call `POST /api/auth/login`, copy the `token` from the response, click **Authorize** in Swagger UI and paste it in — all following requests in that session will be authenticated.

**Default admin login** (override via env vars before deploying anywhere real):
- Email: `admin@ablmess.local`
- Password: `ChangeMe123!`

Example login call:

```
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ablmess.local","password":"ChangeMe123!"}'
```

Use the returned `token` as a `Authorization: Bearer <token>` header on subsequent requests.

Stop and remove containers (data persists in the `db_data` volume):

```
docker compose down
```

Wipe the database too:

```
docker compose down -v
```

### Environment variables (docker-compose.yml)

| Variable | Purpose |
|---|---|
| `ConnectionStrings__Default` | Postgres connection string |
| `Jwt__Key` | Secret used to sign JWTs — **must** be changed before any real deployment |
| `InitialAdmin__Email` / `InitialAdmin__Password` | Credentials for the auto-seeded first Admin account |
| `Smtp__Host` / `Smtp__Port` / `Smtp__Username` / `Smtp__Password` | SMTP server for email notifications — currently blank; notifications will be logged as failed until filled in |
| `Smtp__FromAddress` / `Smtp__FromName` | From-address shown on notification emails |

## Running locally (without Docker)

Requires the .NET 9 SDK and a running PostgreSQL instance.

```
cd src/ABLMess.Api
dotnet run
```

Update the `ConnectionStrings:Default` value in `src/ABLMess.Api/appsettings.json` (or `appsettings.Development.json`) to point at your local Postgres. Migrations apply automatically on startup, same as the Docker path.

## Running tests

```
dotnet test
```

Tests use EF Core's InMemory provider — no database required.
