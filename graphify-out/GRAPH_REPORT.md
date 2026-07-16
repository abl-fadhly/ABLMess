# Graph Report - ABLMess  (2026-07-15)

## Corpus Check
- 161 files · ~54,362 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 942 nodes · 2184 edges · 60 communities (46 shown, 14 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 95 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2ba2b75f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- devDependencies
- .SetUp
- .SetUp
- .SetUp
- ABLMess.Api.Migrations
- .Create
- .SeedCrew
- .SetUp
- .SetUp
- ABLMess.Api.Models
- AuthContext.tsx
- .Create
- RoomsPage.tsx
- .SetUp
- LogsPage.tsx
- compilerOptions
- ReferenceDataPage.tsx
- ABLMess.Api
- RequestsPage.tsx
- compilerOptions
- AblMessDbContext
- react
- JabatansController
- ShipsController
- http
- .Login
- ABLMess.Api.Auth
- Booking
- UsersPage.tsx
- User
- Request
- .TransformAsync
- plugins
- ReminderBackgroundService
- .EnsureInitialAdminAsync
- tsconfig.json
- AblMessDbContextModelSnapshot.cs
- AddNotifications
- MakeUserShipJabatanNullable
- AddPlacedRequestStatus
- AddUserEmployeeCodeAndPhoto
- AddBedStatusAndLocationImage
- AddAuditLog
- React + TypeScript + Vite
- 20260712143005_AddNotifications.Designer.cs
- 20260712143532_MakeUserShipJabatanNullable.Designer.cs
- 20260712144007_AddPlacedRequestStatus.Designer.cs
- 20260715035352_AddUserEmployeeCodeAndPhoto.Designer.cs
- 20260715040639_AddBedStatusAndLocationImage.Designer.cs
- 20260715041523_AddAuditLog.Designer.cs
- CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `ABLMess.Api.Models` - 47 edges
2. `ABLMess.Api.Data` - 32 edges
3. `useFetch()` - 28 edges
4. `ABLMess.Api.Dtos` - 25 edges
5. `User` - 25 edges
6. `react` - 24 edges
7. `AblMessDbContext` - 24 edges
8. `Request` - 19 edges
9. `compilerOptions` - 18 edges
10. `ABLMess.Api.Controllers` - 18 edges

## Surprising Connections (you probably didn't know these)
- `AuthContextValue` --references--> `UserDto`  [EXTRACTED]
  frontend/src/auth/AuthContext.tsx → frontend/src/api/types.ts
- `TestJwtOptions` --references--> `JwtOptions`  [EXTRACTED]
  tests/ABLMess.Api.Tests/TestJwtOptions.cs → src/ABLMess.Api/Auth/JwtOptions.cs
- `FakeEmailSender` --implements--> `IEmailSender`  [EXTRACTED]
  tests/ABLMess.Api.Tests/FakeEmailSender.cs → src/ABLMess.Api/Notifications/IEmailSender.cs
- `AlwaysFailingEmailSender` --implements--> `IEmailSender`  [EXTRACTED]
  tests/ABLMess.Api.Tests/NotificationServiceTests.cs → src/ABLMess.Api/Notifications/IEmailSender.cs
- `HomeRedirect()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/App.tsx → frontend/src/auth/AuthContext.tsx

## Import Cycles
- None detected.

## Communities (60 total, 14 thin omitted)

### Community 0 - "devDependencies"
Cohesion: 0.04
Nodes (46): dependencies, react, react-dom, react-router-dom, tailwindcss, @tailwindcss/vite, devDependencies, jsdom (+38 more)

### Community 1 - ".SetUp"
Cohesion: 0.12
Nodes (24): Dictionary, seededUser, UsersController, ActionResult, Authorize, HttpDelete, HttpGet, HttpPost (+16 more)

### Community 2 - ".SetUp"
Cohesion: 0.06
Nodes (35): Body, sender, service, Booking, DateOnly, DateTime, Notification, NotificationChannel (+27 more)

### Community 3 - ".SetUp"
Cohesion: 0.10
Nodes (27): location, RoomAvailabilityService, DateOnly, Task, RoomsController, ActionResult, DateOnly, HttpDelete (+19 more)

### Community 4 - "ABLMess.Api.Migrations"
Cohesion: 0.33
Nodes (3): ABLMess.Api.Migrations, InitialCreate, ModelBuilder

### Community 5 - ".Create"
Cohesion: 0.10
Nodes (19): ABLMess, Environment variables (docker-compose.yml), Project structure, Roles, Running locally (Docker), Running locally (without Docker), Running tests, Status (+11 more)

### Community 6 - ".SeedCrew"
Cohesion: 0.19
Nodes (15): RequestsController, ActionResult, Authorize, HttpGet, HttpPost, HttpPut, IActionResult, List (+7 more)

### Community 7 - ".SetUp"
Cohesion: 0.14
Nodes (14): ActivityDto, AuditActionType, DashboardDto, DashboardStatsDto, StatTile(), CheckInOutLists(), PendingRequestsCard(), actionBadge (+6 more)

### Community 8 - ".SetUp"
Cohesion: 0.12
Nodes (22): int, DashboardController, ActionResult, HttpGet, List, Task, ActivityDto, ActiveHotelPlacementDto (+14 more)

### Community 9 - "ABLMess.Api.Models"
Cohesion: 0.18
Nodes (10): ABLMess.Api.Dtos, ABLMess.Api.Controllers, ABLMess.Api.Data, ABLMess.Api.Auth, ABLMess.Api.Tests, ABLMess.Api.Models, ABLMess.Api.Audit, ABLMess.Api.Notifications (+2 more)

### Community 10 - "AuthContext.tsx"
Cohesion: 0.11
Nodes (16): getToken(), request(), setToken(), HomeRedirect(), AuthContext, AuthContextValue, AuthProvider(), loadStoredUser() (+8 more)

### Community 11 - ".Create"
Cohesion: 0.10
Nodes (27): bed1, bed2, InlineData, room, LocationsController, ActionResult, HttpDelete, HttpGet (+19 more)

### Community 12 - "RoomsPage.tsx"
Cohesion: 0.13
Nodes (28): ApiError, BedAvailabilityDto, RequestDto, UserDto, BookModal(), ConfirmContext, ConfirmContextValue, ConfirmOptions (+20 more)

### Community 13 - ".SetUp"
Cohesion: 0.07
Nodes (38): bed, gsUser, AuditLogService, BookingsController, ActionResult, HttpGet, HttpPost, HttpPut (+30 more)

### Community 14 - "LogsPage.tsx"
Cohesion: 0.11
Nodes (20): api, BedDto, BedStatus, BookingDto, BookingStatus, HotelPlacementDto, LocationDto, LocationOccupancyDto (+12 more)

### Community 15 - "compilerOptions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+15 more)

### Community 16 - "ReferenceDataPage.tsx"
Cohesion: 0.30
Nodes (16): useConfirm(), useToast(), useBedIndex(), useFetch(), BookingsPage(), statusTone, LogsPage(), MyRequestsPage() (+8 more)

### Community 17 - "ABLMess.Api"
Cohesion: 0.10
Nodes (16): coverlet.collector (6.0.2), Microsoft.AspNetCore.Authentication.JwtBearer (9.*), Microsoft.AspNetCore.Identity (2.3.11), Microsoft.AspNetCore.OpenApi (9.0.8), Microsoft.EntityFrameworkCore.Design (9.*), Microsoft.EntityFrameworkCore.InMemory (9.0.17), Microsoft.EntityFrameworkCore.Relational (9.0.17), Microsoft.NET.Test.Sdk (17.12.0) (+8 more)

### Community 18 - "RequestsPage.tsx"
Cohesion: 0.12
Nodes (26): ActiveHotelPlacementDto, LocationBedOccupancyDto, PendingRequestDto, Icon(), iconPaths, Avatar(), avatarSizeClasses, Badge() (+18 more)

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 20 - "AblMessDbContext"
Cohesion: 0.11
Nodes (15): DbContext, DbSet, AblMessDbContext, ModelBuilder, Bed, DateTime, ICollection, BedStatus (+7 more)

### Community 21 - "react"
Cohesion: 0.20
Nodes (9): App(), ConfirmProvider(), icons, Toast, ToastContext, ToastContextValue, ToastProvider(), ToastType (+1 more)

### Community 22 - "JabatansController"
Cohesion: 0.23
Nodes (11): JabatansController, ActionResult, HttpDelete, HttpGet, HttpPost, HttpPut, IActionResult, List (+3 more)

### Community 23 - "ShipsController"
Cohesion: 0.23
Nodes (11): ShipsController, ActionResult, HttpDelete, HttpGet, HttpPost, HttpPut, IActionResult, List (+3 more)

### Community 24 - "http"
Cohesion: 0.13
Nodes (15): ASPNETCORE_ENVIRONMENT, applicationUrl, commandName, dotnetRunMessages, environmentVariables, launchBrowser, applicationUrl, commandName (+7 more)

### Community 25 - ".Login"
Cohesion: 0.13
Nodes (14): ControllerBase, AuthController, ActionResult, HttpPost, Task, LoginRequest, LoginResponse, AuthControllerTests (+6 more)

### Community 26 - "ABLMess.Api.Auth"
Cohesion: 0.33
Nodes (4): IOptions, JwtOptions, TokenService, TestJwtOptions

### Community 27 - "Booking"
Cohesion: 0.50
Nodes (3): Migration, InitialCreate, MigrationBuilder

### Community 28 - "UsersPage.tsx"
Cohesion: 0.24
Nodes (8): Gender, JabatanDto, ShipDto, UserType, PageHeader(), emptyForm, roleTone, UserFormState

### Community 29 - "User"
Cohesion: 0.13
Nodes (10): UserMappingExtensions, AuditLog, DateTime, AuditActionType, Gender, UserType, Jabatan, Ship (+2 more)

### Community 30 - "Request"
Cohesion: 0.18
Nodes (7): RequestStatus, HotelPlacement, DateOnly, DateTime, Request, DateOnly, DateTime

### Community 31 - ".TransformAsync"
Cohesion: 0.22
Nodes (7): ABLMess.Api, IOpenApiDocumentTransformer, OpenApiDocument, OpenApiDocumentTransformerContext, OpenApiBearerSecuritySchemeTransformer, CancellationToken, Task

### Community 32 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 33 - "ReminderBackgroundService"
Cohesion: 0.43
Nodes (5): BackgroundService, ReminderBackgroundService, CancellationToken, Task, TimeSpan

### Community 34 - ".EnsureInitialAdminAsync"
Cohesion: 0.33
Nodes (4): IConfiguration, SeedData, IPasswordHasher, Task

### Community 45 - "AblMessDbContextModelSnapshot.cs"
Cohesion: 0.40
Nodes (3): ModelSnapshot, AblMessDbContextModelSnapshot, ModelBuilder

### Community 52 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

## Knowledge Gaps
- **150 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+145 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ABLMess.Api.Data` connect `ABLMess.Api.Models` to `.EnsureInitialAdminAsync`, `ABLMess.Api.Migrations`, `AblMessDbContextModelSnapshot.cs`, `AblMessDbContext`, `20260712143005_AddNotifications.Designer.cs`, `20260712143532_MakeUserShipJabatanNullable.Designer.cs`, `20260712144007_AddPlacedRequestStatus.Designer.cs`, `20260715035352_AddUserEmployeeCodeAndPhoto.Designer.cs`, `20260715040639_AddBedStatusAndLocationImage.Designer.cs`, `20260715041523_AddAuditLog.Designer.cs`, `Request`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `ABLMess.Api.Models` connect `ABLMess.Api.Models` to `.SetUp`, `.EnsureInitialAdminAsync`, `.SetUp`, `.SetUp`, `.SetUp`, `.SetUp`, `AblMessDbContext`, `User`, `Request`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `ABLMess.Api.Migrations` connect `ABLMess.Api.Migrations` to `AblMessDbContextModelSnapshot.cs`, `AddNotifications`, `MakeUserShipJabatanNullable`, `AddPlacedRequestStatus`, `AddUserEmployeeCodeAndPhoto`, `AddBedStatusAndLocationImage`, `AddAuditLog`, `20260712143005_AddNotifications.Designer.cs`, `20260712143532_MakeUserShipJabatanNullable.Designer.cs`, `20260712144007_AddPlacedRequestStatus.Designer.cs`, `20260715035352_AddUserEmployeeCodeAndPhoto.Designer.cs`, `20260715040639_AddBedStatusAndLocationImage.Designer.cs`, `20260715041523_AddAuditLog.Designer.cs`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _150 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `.SetUp` be split into smaller, more focused modules?**
  _Cohesion score 0.11594202898550725 - nodes in this community are weakly interconnected._
- **Should `.SetUp` be split into smaller, more focused modules?**
  _Cohesion score 0.06009783368273934 - nodes in this community are weakly interconnected._