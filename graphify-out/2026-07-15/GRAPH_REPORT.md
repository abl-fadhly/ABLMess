# Graph Report - C:\Users\ABL412-FADHLY\Documents\Fadhly\ABLMess  (2026-07-15)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 826 nodes · 1871 edges · 45 communities (44 shown, 1 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 82 edges (avg confidence: 0.8)
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

## God Nodes (most connected - your core abstractions)
1. `ABLMess.Api.Models` - 40 edges
2. `ABLMess.Api.Data` - 28 edges
3. `useFetch()` - 24 edges
4. `ABLMess.Api.Dtos` - 24 edges
5. `User` - 24 edges
6. `AblMessDbContext` - 23 edges
7. `react` - 19 edges
8. `Request` - 19 edges
9. `compilerOptions` - 18 edges
10. `ABLMess.Api.Controllers` - 18 edges

## Surprising Connections (you probably didn't know these)
- `TestJwtOptions` --references--> `JwtOptions`  [EXTRACTED]
  tests/ABLMess.Api.Tests/TestJwtOptions.cs → src/ABLMess.Api/Auth/JwtOptions.cs
- `FakeEmailSender` --implements--> `IEmailSender`  [EXTRACTED]
  tests/ABLMess.Api.Tests/FakeEmailSender.cs → src/ABLMess.Api/Notifications/IEmailSender.cs
- `AlwaysFailingEmailSender` --implements--> `IEmailSender`  [EXTRACTED]
  tests/ABLMess.Api.Tests/NotificationServiceTests.cs → src/ABLMess.Api/Notifications/IEmailSender.cs
- `HomeRedirect()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/App.tsx → frontend/src/auth/AuthContext.tsx
- `seedLoggedInUser()` --calls--> `setToken()`  [EXTRACTED]
  frontend/src/auth/ProtectedRoute.test.tsx → frontend/src/api/client.ts

## Import Cycles
- None detected.

## Communities (45 total, 1 thin omitted)

### Community 0 - "devDependencies"
Cohesion: 0.04
Nodes (46): dependencies, react, react-dom, react-router-dom, tailwindcss, @tailwindcss/vite, devDependencies, jsdom (+38 more)

### Community 1 - ".SetUp"
Cohesion: 0.11
Nodes (24): seededUser, UsersController, ActionResult, Authorize, HttpDelete, HttpGet, HttpPost, HttpPut (+16 more)

### Community 2 - ".SetUp"
Cohesion: 0.07
Nodes (28): Body, sender, service, IEmailSender, CancellationToken, Task, NotificationService, CancellationToken (+20 more)

### Community 3 - ".SetUp"
Cohesion: 0.11
Nodes (23): location, RoomsController, ActionResult, DateOnly, HttpDelete, HttpGet, HttpPost, HttpPut (+15 more)

### Community 4 - "ABLMess.Api.Migrations"
Cohesion: 0.05
Nodes (21): ABLMess.Api.Migrations, Migration, ModelSnapshot, InitialCreate, MigrationBuilder, InitialCreate, ModelBuilder, AddNotifications (+13 more)

### Community 5 - ".Create"
Cohesion: 0.14
Nodes (19): bed1, bed2, InlineData, room, RoomAvailabilityService, DateOnly, Task, AuthControllerTests (+11 more)

### Community 6 - ".SeedCrew"
Cohesion: 0.14
Nodes (20): RequestsController, ActionResult, Authorize, HttpGet, HttpPost, HttpPut, IActionResult, List (+12 more)

### Community 7 - ".SetUp"
Cohesion: 0.16
Nodes (16): bed, BookingsController, ActionResult, HttpGet, HttpPost, HttpPut, IActionResult, List (+8 more)

### Community 8 - ".SetUp"
Cohesion: 0.12
Nodes (20): ControllerBase, int, DashboardController, ActionResult, HttpGet, List, Task, ActiveHotelPlacementDto (+12 more)

### Community 9 - "ABLMess.Api.Models"
Cohesion: 0.21
Nodes (8): ABLMess.Api.Dtos, ABLMess.Api.Controllers, ABLMess.Api.Data, ABLMess.Api.Tests, ABLMess.Api.Models, ABLMess.Api.Notifications, ABLMess.Api.BookingLogic, RequestStatus

### Community 10 - "AuthContext.tsx"
Cohesion: 0.12
Nodes (17): getToken(), request(), setToken(), LoginResponse, UserDto, HomeRedirect(), AuthContext, AuthContextValue (+9 more)

### Community 11 - ".Create"
Cohesion: 0.16
Nodes (16): LocationsController, ActionResult, HttpDelete, HttpGet, HttpPost, HttpPut, IActionResult, List (+8 more)

### Community 12 - "RoomsPage.tsx"
Cohesion: 0.21
Nodes (12): api, ApiError, EmptyState(), ErrorBanner(), Spinner(), Button(), Card(), Input() (+4 more)

### Community 13 - ".SetUp"
Cohesion: 0.15
Nodes (16): gsUser, HotelPlacementsController, ActionResult, HttpGet, HttpPost, List, Task, HotelPlacementDto (+8 more)

### Community 14 - "LogsPage.tsx"
Cohesion: 0.11
Nodes (19): ActiveHotelPlacementDto, BedDto, BookingDto, BookingStatus, DashboardDto, HotelPlacementDto, LocationDto, LocationOccupancyDto (+11 more)

### Community 15 - "compilerOptions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+15 more)

### Community 16 - "ReferenceDataPage.tsx"
Cohesion: 0.23
Nodes (20): useConfirm(), useToast(), useBedIndex(), useFetch(), BookingsPage(), DashboardPage(), todayStr(), tomorrowStr() (+12 more)

### Community 17 - "ABLMess.Api"
Cohesion: 0.10
Nodes (18): coverlet.collector (6.0.2), Microsoft.AspNetCore.Authentication.JwtBearer (9.*), Microsoft.AspNetCore.Identity (2.3.11), Microsoft.AspNetCore.OpenApi (9.0.8), Microsoft.EntityFrameworkCore.Design (9.*), Microsoft.EntityFrameworkCore.InMemory (9.0.17), Microsoft.EntityFrameworkCore.Relational (9.0.17), Microsoft.NET.Test.Sdk (17.12.0) (+10 more)

### Community 18 - "RequestsPage.tsx"
Cohesion: 0.17
Nodes (15): BedAvailabilityDto, RequestDto, Badge(), badgeTones, LinkButton(), Size, sizeClasses, Table() (+7 more)

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 20 - "AblMessDbContext"
Cohesion: 0.12
Nodes (14): DbContext, DbSet, AblMessDbContext, ModelBuilder, Bed, DateTime, ICollection, RoomStatus (+6 more)

### Community 21 - "react"
Cohesion: 0.14
Nodes (15): App(), ConfirmContext, ConfirmContextValue, ConfirmOptions, ConfirmProvider(), PendingConfirm, icons, Toast (+7 more)

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
Cohesion: 0.19
Nodes (8): AuthController, ActionResult, HttpPost, Task, LoginRequest, LoginResponse, TokenServiceTests, Fact

### Community 26 - "ABLMess.Api.Auth"
Cohesion: 0.22
Nodes (5): ABLMess.Api.Auth, IOptions, JwtOptions, TokenService, TestJwtOptions

### Community 27 - "Booking"
Cohesion: 0.24
Nodes (8): Booking, DateOnly, DateTime, BookingStatus, Notification, NotificationChannel, NotificationType, DateTime

### Community 28 - "UsersPage.tsx"
Cohesion: 0.24
Nodes (8): Gender, JabatanDto, ShipDto, UserType, Select(), emptyForm, roleTone, UserFormState

### Community 29 - "User"
Cohesion: 0.22
Nodes (6): Gender, UserType, Jabatan, Ship, User, DateTime

### Community 30 - "Request"
Cohesion: 0.20
Nodes (6): HotelPlacement, DateOnly, DateTime, Request, DateOnly, DateTime

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

## Knowledge Gaps
- **126 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+121 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ABLMess.Api.Data` connect `ABLMess.Api.Models` to `.EnsureInitialAdminAsync`, `ABLMess.Api.Migrations`, `AblMessDbContext`, `ABLMess.Api.Auth`, `Booking`, `Request`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `ABLMess.Api.Models` connect `ABLMess.Api.Models` to `.SetUp`, `.EnsureInitialAdminAsync`, `.SetUp`, `.SeedCrew`, `.SetUp`, `AblMessDbContext`, `ABLMess.Api.Auth`, `Booking`, `User`, `Request`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `User` connect `User` to `.SetUp`, `.EnsureInitialAdminAsync`, `.SetUp`, `.Create`, `.SeedCrew`, `.SetUp`, `.SetUp`, `.SetUp`, `AblMessDbContext`, `.Login`, `Booking`, `Request`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `.SetUp` be split into smaller, more focused modules?**
  _Cohesion score 0.11400966183574879 - nodes in this community are weakly interconnected._
- **Should `.SetUp` be split into smaller, more focused modules?**
  _Cohesion score 0.07272727272727272 - nodes in this community are weakly interconnected._