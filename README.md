# Job Application Tracker — Project Status

A personal web app to track job applications, with a later phase that
detects application-related emails and stages them for review instead
of auto-creating records.

## Tech stack

- **Backend**: ASP.NET Core (.NET 10) Web API, EF Core, SQL Server Express
- **Frontend**: React (not started yet)
- **Architecture**: 3-layer (Controller > Service > EF Core/DbContext)

## Phasing

- **v1** — manual CRUD, status history, job posting storage, real auth — **backend complete**
- **v2** — Gmail-based email detection, review-and-confirm workflow — not started

---

## Database — implemented tables

All tables below exist via applied EF Core migrations against a local
SQL Server Express instance. No deletes anywhere except a
practice-only `Company` delete endpoint (commented out, not part of
the real design).

### AspNetUsers (+ Identity support tables)
Created by ASP.NET Core Identity (`IdentityDbContext<IdentityUser<Guid>, IdentityRole<Guid>, Guid>`).
Real user accounts — registration verified with Identity's password
rules, login verified with hashed password checks.

### Companies
`Id`, `UserId`, `CompanyName`, `WebsiteUrl`, `Industry`, `CreatedAt`.
Unique index on `(UserId, CompanyName)`. Full CRUD implemented:
`GetAll`, `GetById`, `Create` (with normalized check-or-create dedup
— case-insensitive, trimmed, scoped per user), `Update` (partial
updates via null-means-unchanged, empty-string-means-clear for
optional fields, duplicate-name revalidation on rename), and a
practice-only `Delete` (commented out).

### JobApplications
`Id`, `UserId`, `CompanyId` (FK, `Restrict` on delete), `JobTitle`,
`JobPostingUrl`, `Location`, `DateApplied`, `CurrentStatus` (string,
always starts `"Applied"`), `CreatedVia` (`"Manual"`/`"EmailImport"`,
not client-settable), `Notes`, `CreatedAt`, `UpdatedAt`. Full CRUD:
`GetAll`, `GetById`, `Create` (validates `CompanyId` belongs to the
user, writes the initial `"Applied"` history row in the same
transaction, no duplicate-check — multiple applications to the same
company are allowed by design), `Update` (same optional-field
pattern, can reassign `CompanyId` with the same ownership
revalidation as Create).

### ApplicationStatusHistory
`Id`, `JobApplicationId` (FK, `Cascade` on delete), `Status`,
`ChangedAt`, `Note`, `Source` (`"Manual"`/`"EmailDetected"`),
`SourceEmailId` (nullable, not a real FK yet — `EmailMessages`
doesn't exist until v2). `UpdateStatus` endpoint writes a new history
row and updates `CurrentStatus`/`UpdatedAt` on the parent in one
`SaveChangesAsync()` call — proven to not need an explicit
transaction, since EF Core batches everything pending into one atomic
call. A `GetStatusHistory` endpoint returns the full timeline, oldest
first, ownership-checked through the parent `JobApplication`.

### JobPostingDetails
`Id`, `JobApplicationId` (FK, `Cascade`, unique — real 1:1, enforced
automatically by EF Core's own convention when a one-to-one
relationship is configured, no explicit unique index needed),
`RawText`, `DetailsJson` (opaque, read-only, never queried at the DB
level), `CreatedAt`. A single `Upsert` endpoint handles both create
and update (collapsing what would've been two endpoints elsewhere,
since the user's mental action is always "save the details for this
application" either way) with a distinct `Created`/`Updated` result
enum. `GetById` has a three-way result — `Success`,
`ApplicationNotFound` (real error), `NoDetailsYet` (normal empty
state, not an error) — a distinction that matters for how the
eventual frontend should render each case.

### RefreshTokens
`Id`, `UserId`, `TokenHash` (SHA-256, never the raw token — same
principle as password hashing), `ExpiresAt`, `CreatedAt`,
`RevokedAt`, `ReplacedByTokenId`. Backs real login-session revocation
— tested end to end: logging out revokes the active refresh token,
and a subsequent refresh attempt with that same token correctly
returns 401.

---

## Auth — fully implemented

- **ASP.NET Core Identity** (`IdentityUser<Guid>`) for registration
  and password verification — real hashing, no custom password logic
  written.
- **JWT access token** (20 min expiry) + **refresh token** (7 days,
  server-side, rotated on every use — the old token is marked revoked
  and linked via `ReplacedByTokenId` the moment a new one is issued).
- Both tokens issued as **httpOnly, Secure cookies** set directly by
  `AuthController` — never touched by JavaScript.
- `AuthService` holds all EF Core/Identity work; `AuthController`
  only handles cookie read/write — same layering discipline as every
  other controller.
- Endpoints: `POST /api/auth/register`, `/login`, `/refresh`,
  `/logout` — all tested end to end, including the actual revocation
  proof (a revoked refresh token genuinely fails on reuse, not just
  cosmetically cleared client-side).
- `ApiControllerBase` (`[Authorize]` + `CurrentUserId` from
  `ClaimTypes.NameIdentifier`) is now the base class for every
  protected controller — `Companies` and `JobApplications` are both
  fully converted, no `{userId}` route parameters remain anywhere.
- Local testing note: VS Code's REST Client extension has known bugs
  around multi-cookie handling (`Set-Cookie` headers get incorrectly
  merged onto one line for display, and its automatic cookie-jar
  feature is unreliable) — worked around by manually copying token
  values into `.http` file variables rather than relying on automatic
  cookie chaining. Real browser behavior (once the frontend exists)
  won't have this issue.

---

## Not yet built

- Frontend (entirely — routing, data-fetching, all pages)
- v2 email integration (Gmail OAuth, ingestion pipeline, classify/
  extract, `PendingJobApplications`/`PendingStatusChanges` staging
  tables)
- Testing (unit/integration) and deployment
- `MailboxConnections` table (v2 prerequisite)