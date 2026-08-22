# Job Application Tracker — Project Plan

A personal web app to track job applications, with a later phase that
detects application-related emails and stages them for review instead
of auto-creating records.

## Tech stack

- **Backend**: ASP.NET Core (.NET 10) Web API, EF Core, SQL Server
- **Frontend**: React
- **Architecture**: 3-layer (Presentation/API → Business Logic → Data Access)

## Phasing

- **v1** — manual CRUD, status history, job posting storage
- **v2** — Gmail-based email detection, review-and-confirm workflow

---

## Solution structure

Monorepo, mirroring the backend+Vue split from the WMS project:

```
JobApplicationTracker/
├── backend/
│   ├── JobTracker.sln
│   └── src/
│       └── JobTracker.Api/          (single project for now)
│           ├── Program.cs
│           ├── appsettings.json
│           ├── Api/                 (Controllers, DTOs)
│           ├── Application/         (Interfaces, Services)
│           ├── Infrastructure/      (DbContext, Repositories)
│           └── Domain/              (Entities)
├── frontend/
│   └── (React app)
└── README.md
```

**Decision**: starting as a single project with folders that mirror
layer boundaries via namespaces (not enforced by the compiler yet).
The intent is to split into separate projects per layer
(`JobTracker.Domain`, `.Application`, `.Infrastructure`, `.Api`) later
if/when the project grows enough to need compiler-enforced boundaries.
Keeping folder/namespace naming consistent now makes that future split
mechanical rather than a rewrite.

Each layer only calls the one directly below it: Controller → Service,
Service → Repository/DbContext. No skipping layers, even without the
compiler enforcing it — e.g. Controllers only ever hold references
typed as interfaces (`IJobApplicationService`), never a concrete
`DbContext`.

---

## Database schema

No deletes anywhere yet (append-only). All status-like fields are
plain strings, not enums — hiring processes differ too much per
company to force a fixed set of values.

### Users
Identity-managed (`Id`, `Email`, password hash, etc.)

### Companies
| Field | Notes |
|---|---|
| Id | PK |
| UserId | FK |
| Name | unique per `(UserId, Name)` |
| WebsiteUrl | nullable |
| Industry | nullable |
| CreatedAt | |

### JobApplications
| Field | Notes |
|---|---|
| Id | PK |
| UserId | FK |
| CompanyId | FK |
| JobTitle | |
| JobPostingUrl | nullable — link to the posting |
| Location | |
| DateApplied | |
| CurrentStatus | string, denormalized copy of latest status; always starts as `"Applied"` |
| CreatedVia | `Manual` \| `EmailImport` |
| Notes | nullable |
| CreatedAt / UpdatedAt | |

Required to create: company, job title, date applied. Everything else optional.

### JobPostingDetails (1:1 with JobApplications)
| Field | Notes |
|---|---|
| Id | PK |
| JobApplicationId | FK, unique |
| RawText | full copy-pasted job posting, always present |
| DetailsJson | extracted sections (about company, why join, etc.) — **read-only, never queried at the DB level**, just deserialized in the app layer |

Stays on SQL Server — no separate NoSQL database. A second database
would only be justified by high write volume, need to query inside
the document, or scale requirements, none of which apply here.

### ApplicationStatusHistory
| Field | Notes |
|---|---|
| Id | PK |
| JobApplicationId | FK, cascade delete |
| Status | string, freeform |
| ChangedAt | |
| Note | nullable |
| Source | `Manual` \| `EmailDetected` |
| SourceEmailId | nullable FK → EmailMessages |

No state machine — any status string, any transition allowed.

### EmailMessages (v2)
| Field | Notes |
|---|---|
| Id | PK |
| UserId | FK |
| ExternalMessageId | Gmail message ID — dedup / idempotency |
| Subject / SenderEmail / ReceivedAt | |
| ClassifiedAs | `JobRelated` \| `NotJobRelated` \| `Uncertain` |
| ProcessedAt | nullable |
| RawBodySnippet | nullable, truncated |

### PendingJobApplications (v2 — review staging, new candidates)
| Field | Notes |
|---|---|
| Id | PK |
| UserId | FK |
| EmailMessageId | FK |
| CompanyNameGuess / JobTitleGuess / JobPostingUrlGuess / StatusGuess | parser output |
| DetailsJson | nullable |
| ReviewStatus | `Pending` \| `Confirmed` \| `Dismissed` |
| DetectedAt / ReviewedAt | |
| LinkedJobApplicationId | nullable FK, set once confirmed |

Dismissed rows stick around forever for now — a delete option can be
added later if needed.

### PendingStatusChanges (v2 — review staging, status updates)
Mirrors `PendingJobApplications` but for detected status changes on an
**existing** application: `Id`, `UserId`, `JobApplicationId`,
`EmailMessageId`, `StatusGuess`, `NoteGuess`, `ReviewStatus`,
`DetectedAt`, `ReviewedAt`.

### Attachments
`Id`, `JobApplicationId` (FK), `FileName`, `FileType`, `StoragePath`, `UploadedAt`

---

## API design

REST, resource-based, plural nouns:

```
GET    /api/job-applications              list (filters + pagination)
GET    /api/job-applications/{id}         full detail
POST   /api/job-applications              create (manual)
PUT    /api/job-applications/{id}         update editable fields
POST   /api/job-applications/{id}/status  change status (separate from PUT —
                                           it's an event, writes StatusHistory)
GET    /api/job-applications/{id}/status-history

GET    /api/companies
POST   /api/companies

GET    /api/pending-job-applications
POST   /api/pending-job-applications/{id}/confirm
POST   /api/pending-job-applications/{id}/dismiss

GET    /api/pending-status-changes
POST   /api/pending-status-changes/{id}/confirm
POST   /api/pending-status-changes/{id}/dismiss

POST   /api/mailbox/sync-now              manual trigger, shares logic
                                           with the scheduled poll job
```

**List filtering**: status, companyId, dateApplied range, createdVia,
free-text search (matches job title + company name).

**Sorting**: default `DateApplied desc`; optional sort by company name.

**Pagination**: offset-based (`page` / `pageSize`), default page size **20**.

**Response shape**: envelope object — `{ items, totalCount, page, pageSize }`.

**Mapping**: manual DTO ↔ entity mapping, no AutoMapper/Mapster —
chosen deliberately for clarity while learning.

**DTOs**: never expose EF Core entities directly.
`JobApplicationListItemDto` (lean, for lists), `JobApplicationDetailDto`
(full, nested details + history), `CreateJobApplicationDto`,
`ChangeStatusDto`, `ConfirmPendingApplicationDto` (lets the user
correct guessed fields before they become real data).

---

## Business logic rules

- **Status**: `CurrentStatus` always initializes to `"Applied"` on
  creation, even if logging something retroactively that's already
  further along — fast-forward via the normal status-change flow
  afterward, so `ApplicationStatusHistory` still has a consistent
  starting point.
- **Manual company matching**: autocomplete/search dropdown in the UI
  (the human is the matcher) **plus** a normalized
  (lowercase/trim) check-or-create safety net in the backend, so a
  duplicate can't sneak in even if the UI step is bypassed.
- **Email company matching (v2)**: must read the **email body content**,
  not just sender domain — ATS platforms (Greenhouse, Workday, Lever,
  LinkedIn) send from generic domains that reveal nothing about the
  actual company.
- **Transactional operations** (all-or-nothing):
  - Create `JobApplication` with a new company → create-or-reuse
    `Company` → create `JobApplication` → write initial
    `ApplicationStatusHistory` row.
  - Confirm `PendingJobApplication` → create-or-reuse `Company` →
    create `JobApplication` → create `JobPostingDetails` → write
    initial `ApplicationStatusHistory` → update the pending row.
  - Confirm `PendingStatusChange` → write `ApplicationStatusHistory` →
    update `JobApplication.CurrentStatus`.
- **Guard rule**: confirming/dismissing an already-actioned pending
  record (`ReviewStatus != Pending`) is rejected — prevents
  double-processing on retries.

---

## Auth

- **ASP.NET Core Identity** for user/password management.
- **JWT access token + refresh token pair**: access token short-lived
  (~15–30 min), refresh token longer-lived and tracked server-side in
  a `RefreshTokens` table (`TokenHash`, `ExpiresAt`, `RevokedAt`,
  `ReplacedByTokenId` for rotation) so sessions can be revoked, not
  just trusted by signature alone.
- **Storage**: both tokens as **httpOnly, Secure cookies** (chosen
  over localStorage this time, unlike the WMS project) — protects
  against XSS reading the token directly.
- **CSRF mitigation**: `SameSite` cookie attribute + requiring a
  custom header on state-changing requests (cross-site form
  submissions can't set custom headers).
- **Local dev note**: cross-origin cookies need either
  `SameSite=None; Secure` (HTTPS even locally) or a Vite dev-server
  proxy to keep frontend/backend same-origin during development —
  proxy is the simpler route.

---

## Phase 2 — email integration (Gmail)

Pipeline: **Ingest → Classify → Extract → Match → Stage for review.**
Nothing ever writes to `JobApplications` or `ApplicationStatusHistory`
without a manual confirm.

- **Provider**: Gmail only for now.
- **Trigger**: polling (scheduled background job) **plus** a manual
  "check now" endpoint — both call the same shared sync service
  (`IEmailSyncService`) so the logic isn't duplicated. Manual trigger
  gets a cooldown to avoid hammering the Gmail API quota.
- **Classify/extract**: a cheap heuristic/keyword filter runs first to
  cut obvious noise, then only likely candidates go through the
  heavier classify+extract step — cost control, not just simplicity.
- **LLM choice deliberately left open** (self-trained model vs. cloud
  API) — abstracted behind an interface
  (e.g. `IJobEmailClassifier`) in the Application layer, so the rest
  of the pipeline never needs to know which one is behind it. Decide
  this when phase 2 is actually reached.
- **Mailbox connection**: needs its own `MailboxConnections` table
  (separate from app auth) — `UserId`, `Provider`, encrypted
  access/refresh tokens, `ExpiresAt`, and a sync checkpoint
  (`LastSyncedAt` / `LastHistoryId`) so polling only fetches new mail.
- **Idempotency**: `EmailMessages.ExternalMessageId` prevents
  reprocessing the same email twice.

---

## Not yet decided

- **Frontend structure** — routing/page list, data-fetching approach
  (React Query vs plain fetch)
- **Testing & deployment** — unit/integration test strategy,
  deployment target (or purely local/GitHub portfolio project)
