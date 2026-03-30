# ARCHITECTURE.md — V1 Technical Architecture

Technical architecture reference for the AI Strategy Training Platform. All implementation must conform to this document. Deviations require explicit discussion and an update to this file before code is written.

---

## Architecture Summary

The application is a **Next.js App Router** project with a strict three-layer architecture. The default rendering mode is **React Server Components**. Client Components are used only where interactivity, browser APIs, or animations are required.

Data mutations are handled exclusively via **Next.js Server Actions** — no REST API layer is introduced in V1. An `/api` route group exists only for future webhooks and third-party callbacks.

AI-dependent operations (playbook generation, training prompt generation, response scoring) are **abstracted behind a service interface** from day one. In V1, the implementation behind that interface begins as a structured mock. This means the full product can be built, tested, and used before any LLM integration is added — and the LLM can be swapped in with no changes to domain or UI code.

The database is **PostgreSQL** accessed via **Prisma**. No raw SQL in V1.

Authentication is handled by **NextAuth.js** (Auth.js v5) using email/password in V1.

---

## Folder Structure

```
trader/
├── prisma/
│   ├── schema.prisma          # Authoritative data model
│   └── migrations/            # Prisma migration history
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Route group — unauthenticated
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (app)/             # Route group — authenticated, shared layout
│   │   │   ├── layout.tsx     # App shell: sidebar, header
│   │   │   ├── dashboard/
│   │   │   ├── onboarding/
│   │   │   │   ├── strategy/
│   │   │   │   ├── playbook/
│   │   │   │   ├── setup/
│   │   │   │   └── complete/
│   │   │   ├── playbook/
│   │   │   │   ├── page.tsx
│   │   │   │   └── rules/
│   │   │   ├── setups/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   └── [setupId]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── examples/
│   │   │   ├── train/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   └── session/
│   │   │   │       └── [sessionId]/
│   │   │   │           ├── page.tsx
│   │   │   │           └── results/
│   │   │   └── review/
│   │   │       ├── page.tsx
│   │   │       ├── new/
│   │   │       └── [reviewId]/
│   │   ├── api/               # API routes (webhooks only in V1)
│   │   ├── layout.tsx         # Root layout: fonts, theme, providers
│   │   └── page.tsx           # Landing page (unauthenticated)
│   │
│   ├── features/              # Feature-scoped modules
│   │   ├── strategy/
│   │   │   ├── ui/
│   │   │   ├── domain/
│   │   │   ├── data/
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── playbook/
│   │   │   ├── ui/
│   │   │   ├── domain/
│   │   │   ├── data/
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── setup-library/
│   │   │   ├── ui/
│   │   │   ├── domain/
│   │   │   ├── data/
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── training/
│   │   │   ├── ui/
│   │   │   ├── domain/
│   │   │   ├── data/
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   └── trade-review/
│   │       ├── ui/
│   │       ├── domain/
│   │       ├── data/
│   │       ├── types.ts
│   │       └── index.ts
│   │
│   ├── components/            # Shared, feature-agnostic UI
│   │   ├── ui/                # shadcn/ui components (customized)
│   │   ├── layout/            # Sidebar, header, page shell
│   │   └── shared/            # Cards, badges, score displays, etc.
│   │
│   ├── server/
│   │   └── actions/           # Next.js Server Actions (one file per feature)
│   │       ├── strategy.ts
│   │       ├── playbook.ts
│   │       ├── setup.ts
│   │       ├── training.ts
│   │       └── review.ts
│   │
│   ├── services/
│   │   └── ai/                # AI service abstraction layer
│   │       ├── types.ts       # Input/output interfaces (never changes)
│   │       ├── index.ts       # Exports the active AI service instance
│   │       ├── mock.ts        # V1 implementation: structured mock
│   │       └── providers/     # Future: openai.ts, anthropic.ts, etc.
│   │
│   ├── db/
│   │   └── client.ts          # Singleton Prisma client
│   │
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── utils.ts           # Shared utility functions
│   │   └── constants.ts       # App-wide constants
│   │
│   ├── hooks/                 # Shared custom React hooks
│   ├── types/                 # Globally shared TypeScript types
│   └── styles/
│       └── globals.css        # Tailwind base, CSS variables for design tokens
│
├── public/
├── AGENTS.md
├── PRODUCT.md
├── ARCHITECTURE.md
└── ... (config files)
```

---

## Domain Modules

Each feature in `src/features/` is a self-contained module. The module owns its UI components, domain logic, data access functions, and types. Nothing outside the module imports from inside it — only from its `index.ts`.

### `strategy`
Owns the Strategy intake lifecycle: form state, field validation, submission, and status transitions (DRAFT → SUBMITTED → PROCESSED). The domain layer validates that all required fields are present before submission. The data layer persists and retrieves Strategy records.

### `playbook`
Owns the Playbook lifecycle: generating a draft from a processed Strategy, presenting the draft for trader review, applying trader edits, confirming, and versioning. The domain layer contains the logic for creating a new version (copy-forward rules) and enforcing the single-active-confirmed-playbook invariant. The data layer persists Playbook and Rule records.

### `setup-library`
Owns Setup creation, editing, and SetupExample management (upload, annotate, classify). The domain layer handles annotation data structure and validates that examples have a valid classification. The data layer persists Setup and SetupExample records and handles image URL storage (V1: stored as URLs pointing to uploaded files, not base64 in DB).

### `training`
Owns TrainingSession lifecycle: session configuration, prompt generation (via AI service interface), response capture, scoring (via AI service interface), and session completion. The domain layer owns the session state machine and prompt ordering logic. The data layer persists TrainingSession, TrainingPrompt, and TrainingResponse records.

### `trade-review`
Owns TradeReview creation and rule adherence entry. The domain layer computes the `adherenceScore` from the individual rule entries. The data layer persists TradeReview and TradeReviewRuleEntry records.

---

## Layer Boundaries

### Strict import rules

```
app/ (pages)
  └── imports from → server/actions/
                     features/*/index.ts
                     components/

server/actions/
  └── imports from → features/*/index.ts (domain functions only)
                     db/client.ts is NOT imported here directly

features/*/domain/
  └── imports from → features/*/types.ts
                     lib/
                     services/ai/types.ts  (interface only, never implementation)
                     NO Prisma imports
                     NO other feature internals

features/*/data/
  └── imports from → db/client.ts
                     features/*/types.ts
                     NO domain imports
                     NO UI imports

features/*/ui/
  └── imports from → features/*/types.ts
                     components/
                     hooks/
                     NO direct data layer imports
                     NO direct AI service imports
```

### What Server Actions do
Server Actions are thin coordinators. They:
1. Validate the caller is authenticated
2. Parse and coerce incoming form data
3. Call one domain function
4. Return a typed result to the client

They do not contain business logic. They do not import Prisma directly.

### What domain functions do
Domain functions are pure business logic. They:
1. Accept plain typed inputs (never raw form data, never Prisma models)
2. Call data layer functions to read/write
3. Call the AI service interface when needed
4. Return typed results (never throw — return `{ ok: true, data }` or `{ ok: false, error }`)

### Data layer functions
Data functions are Prisma wrappers. They:
1. Accept plain typed inputs
2. Execute Prisma queries
3. Map Prisma results to domain types (no raw Prisma types escape this layer)
4. Return typed results

---

## Route Map

```
/                                     Landing page (public)
/login                                Sign in
/register                             Create account

/onboarding/strategy                  Step 1: Describe your strategy
/onboarding/playbook                  Step 2: Review generated playbook
/onboarding/setup                     Step 3: Add first setup
/onboarding/complete                  Onboarding done — go to dashboard

/dashboard                            Overview: playbook status, streak, last session

/playbook                             Full playbook view
/playbook/rules                       Rule list — edit, reorder, add

/setups                               Setup library grid
/setups/new                           Create new setup
/setups/[setupId]                     Setup detail: conditions + example gallery
/setups/[setupId]/examples/new        Upload and annotate a new example

/train                                Training hub: start session, history
/train/new                            Session configuration (type, length)
/train/session/[sessionId]            Active training session
/train/session/[sessionId]/results    Session results and feedback

/review                               Trade review history
/review/new                           Log a new trade review
/review/[reviewId]                    Past trade review detail
```

All routes under `/onboarding` and `/(app)` require authentication. The middleware redirects unauthenticated users to `/login`. Users who have not completed onboarding are redirected to `/onboarding/strategy` if they attempt to access any `/(app)` route.

---

## Database Schema

Defined as a Prisma schema. This is the authoritative V1 data model.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String   // hashed — bcrypt
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  strategy      Strategy?
  sessions      TrainingSession[]
  tradeReviews  TradeReview[]

  @@map("users")
}

// ─── Strategy ─────────────────────────────────────────────────────────────────

model Strategy {
  id                     String         @id @default(cuid())
  userId                 String         @unique   // one strategy per user in V1
  instrument             String
  timeframe              String
  description            String         @db.Text
  entryConditions        String         @db.Text
  exitConditions         String         @db.Text
  invalidationConditions String         @db.Text
  riskRules              String         @db.Text
  whatMakesValid         String         @db.Text
  whatMakesInvalid       String         @db.Text
  status                 StrategyStatus @default(DRAFT)
  createdAt              DateTime       @default(now())
  updatedAt              DateTime       @updatedAt

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  playbooks Playbook[]

  @@map("strategies")
}

enum StrategyStatus {
  DRAFT
  SUBMITTED
  PROCESSED
}

// ─── Playbook ─────────────────────────────────────────────────────────────────

model Playbook {
  id          String         @id @default(cuid())
  strategyId  String
  userId      String
  version     Int            @default(1)
  summary     String         @db.Text
  status      PlaybookStatus @default(DRAFT)
  createdAt   DateTime       @default(now())
  confirmedAt DateTime?

  strategy Strategy @relation(fields: [strategyId], references: [id], onDelete: Cascade)
  rules    Rule[]
  setups   Setup[]

  @@unique([strategyId, version])
  @@map("playbooks")
}

enum PlaybookStatus {
  DRAFT
  CONFIRMED
  ARCHIVED
}

model Rule {
  id          String       @id @default(cuid())
  playbookId  String
  text        String       @db.Text
  category    RuleCategory
  inChecklist Boolean      @default(false)
  source      RuleSource   @default(AI_GENERATED)
  order       Int
  createdAt   DateTime     @default(now())

  playbook      Playbook               @relation(fields: [playbookId], references: [id], onDelete: Cascade)
  reviewEntries TradeReviewRuleEntry[]
  prompts       TrainingPrompt[]

  @@map("rules")
}

enum RuleCategory {
  ENTRY
  EXIT
  INVALIDATION
  RISK
  MINDSET
}

enum RuleSource {
  AI_GENERATED
  TRADER_ADDED
}

// ─── Setup Library ─────────────────────────────────────────────────────────────

model Setup {
  id                    String   @id @default(cuid())
  playbookId            String
  userId                String
  name                  String
  description           String   @db.Text
  entryCondition        String   @db.Text
  exitCondition         String   @db.Text
  invalidationCondition String   @db.Text
  tags                  String[]
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  playbook Playbook       @relation(fields: [playbookId], references: [id], onDelete: Cascade)
  examples SetupExample[]
  prompts  TrainingPrompt[]

  @@map("setups")
}

model SetupExample {
  id               String                 @id @default(cuid())
  setupId          String
  imageUrl         String
  annotationData   Json                   @default("{}")
  classification   ExampleClassification
  notes            String?                @db.Text
  createdAt        DateTime               @default(now())

  setup   Setup            @relation(fields: [setupId], references: [id], onDelete: Cascade)
  prompts TrainingPrompt[]

  @@map("setup_examples")
}

enum ExampleClassification {
  VALID
  INVALID
}

// ─── Training ─────────────────────────────────────────────────────────────────

model TrainingSession {
  id              String      @id @default(cuid())
  userId          String
  type            SessionType
  promptCount     Int
  correctCount    Int         @default(0)
  score           Float       @default(0)
  durationSeconds Int?
  createdAt       DateTime    @default(now())

  user    User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  prompts TrainingPrompt[]

  @@map("training_sessions")
}

enum SessionType {
  SETUP_RECOGNITION
  RULE_RECALL
}

model TrainingPrompt {
  id             String      @id @default(cuid())
  sessionId      String
  type           SessionType
  setupExampleId String?
  ruleId         String?
  questionText   String      @db.Text
  expectedAnswer String      @db.Text
  order          Int

  session      TrainingSession   @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  setupExample SetupExample?     @relation(fields: [setupExampleId], references: [id])
  rule         Rule?             @relation(fields: [ruleId], references: [id])
  setup        Setup?            @relation(fields: [setupId], references: [id])
  setupId      String?
  response     TrainingResponse?

  @@map("training_prompts")
}

model TrainingResponse {
  id             String                 @id @default(cuid())
  promptId       String                 @unique
  sessionId      String
  responseText   String                 @db.Text
  classification ExampleClassification?
  isCorrect      Boolean
  feedback       String                 @db.Text
  confidence     ConfidenceLevel?
  createdAt      DateTime               @default(now())

  prompt TrainingPrompt @relation(fields: [promptId], references: [id], onDelete: Cascade)

  @@map("training_responses")
}

enum ConfidenceLevel {
  LOW
  MEDIUM
  HIGH
}

// ─── Trade Review ─────────────────────────────────────────────────────────────

model TradeReview {
  id              String   @id @default(cuid())
  userId          String
  setupName       String   // free text — trader types which setup they took
  notes           String?  @db.Text
  adherenceScore  Float    // computed from rule entries: followed / total applicable
  tradedAt        DateTime
  createdAt       DateTime @default(now())

  user        User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  ruleEntries TradeReviewRuleEntry[]

  @@map("trade_reviews")
}

model TradeReviewRuleEntry {
  id            String              @id @default(cuid())
  tradeReviewId String
  ruleId        String
  result        RuleAdherenceResult
  note          String?             @db.Text

  tradeReview TradeReview @relation(fields: [tradeReviewId], references: [id], onDelete: Cascade)
  rule        Rule        @relation(fields: [ruleId], references: [id])

  @@map("trade_review_rule_entries")
}

enum RuleAdherenceResult {
  FOLLOWED
  NOT_FOLLOWED
  NOT_APPLICABLE
}
```

---

## AI Service Boundaries

This is the most important architectural decision in V1. Every AI-dependent operation is abstracted behind a typed interface. The interface never changes when the implementation changes.

### The interface (`src/services/ai/types.ts`)

```typescript
// These types define the contract. The implementation is irrelevant to callers.

export interface PlaybookDraft {
  summary: string
  rules: Array<{
    text: string
    category: RuleCategory
    inChecklist: boolean
  }>
}

export interface SessionPlan {
  prompts: Array<{
    type: SessionType
    setupExampleId?: string
    ruleId?: string
    questionText: string
    expectedAnswer: string
  }>
}

export interface ScoredResponse {
  isCorrect: boolean
  feedback: string
}

export interface AIService {
  generatePlaybook(input: StrategyInput): Promise<PlaybookDraft>
  generateSessionPlan(playbook: PlaybookView, setups: SetupView[]): Promise<SessionPlan>
  scoreResponse(prompt: PromptView, responseText: string): Promise<ScoredResponse>
}
```

### V1 mock implementation (`src/services/ai/mock.ts`)

The mock does not call any external API. It:
- `generatePlaybook`: Parses the strategy input text, splits on sentence boundaries, and produces a structured rule list organized by keyword patterns (e.g., sentences containing "entry" → ENTRY category). Produces a working playbook immediately.
- `generateSessionPlan`: Takes existing setup examples and checklist rules, shuffles them, and generates simple question strings.
- `scoreResponse`: For setup recognition, compares the classification directly. For rule recall, checks if any of the rule's keywords appear in the response.

### Transition to real AI

When AI integration is added, a new file (e.g., `src/services/ai/providers/anthropic.ts`) implements the same `AIService` interface. The `src/services/ai/index.ts` file switches which implementation is exported based on an environment variable (`AI_PROVIDER=mock|anthropic`). Zero changes to domain, UI, or server action code.

---

## Versioned Playbooks

**The problem:** A trader's strategy evolves. When they update their playbook, historical training sessions and trade reviews should still reference the rules that were active at that time. The playbook version must be immutable once confirmed.

**V1 approach — version-on-confirm:**

1. Every Playbook record has a `version` integer and a `status` (DRAFT | CONFIRMED | ARCHIVED).
2. Only one Playbook per user can be in CONFIRMED status at a time.
3. When a confirmed Playbook is edited: the existing confirmed version is ARCHIVED, and a new Playbook record is created with `version + 1` and status DRAFT. Rules are copied forward as a starting point.
4. The new draft is edited and re-confirmed.
5. TrainingPrompts and TradeReviewRuleEntries hold FK references to specific Rule records, which belong to a specific Playbook version. Historical records are therefore always accurate.
6. The domain function `getActivePlaybook(userId)` always returns the single CONFIRMED playbook. If none exists, it returns the most recent DRAFT.

**What this means for the UI:** The playbook page always shows the active (CONFIRMED) version. An "Edit Playbook" action starts a new draft revision. The trader edits the draft, then confirms it — at which point the old version is archived and the new version becomes active.

---

## V1 Implementation Phases

Build in this order. Each phase is independently shippable.

### Phase 1 — Foundation
Everything needed before any feature can be built.
- Project scaffolding: Next.js, TypeScript, Tailwind, shadcn/ui, Prisma
- Database: PostgreSQL connection, Prisma schema, initial migration
- Auth: NextAuth with email/password, session middleware
- App shell: sidebar navigation, page layout, dark theme, design tokens
- Landing page

### Phase 2 — Strategy Intake and Playbook
The core input flow. First real value for the trader.
- Strategy intake form (all guided fields)
- Server action: submit strategy
- AI service: mock `generatePlaybook`
- Playbook draft view: rules listed by category, editable
- Rule add/edit/reorder
- Playbook confirm action (version 1 created)
- Playbook detail page (read-only confirmed view)

### Phase 3 — Setup Library
Visual, tactile, and satisfying to build. Demonstrates product premium quality.
- Setup creation form
- SetupExample upload (image upload to storage, URL persisted)
- Annotation UI (draw regions, add labels on screenshots)
- Setup library grid view
- Setup detail view (conditions + example gallery, valid/invalid classification)

### Phase 4 — Training Sessions
The core product loop. Must feel sharp and fast.
- Session configuration screen (type, length)
- AI service: mock `generateSessionPlan`
- Active session UI (one prompt at a time, smooth transitions)
- Response capture (classification toggle for setup recognition, text input for rule recall)
- AI service: mock `scoreResponse`
- Session results screen (score, per-prompt feedback)
- Training history list

### Phase 5 — Trade Review
Lighter lift. Closes the daily loop.
- Trade review form (setup name, rule checklist — followed/not/n/a)
- Adherence score computation (domain function)
- Review detail view
- Review history list

### Phase 6 — Onboarding Flow
Thread the features together into a guided first-run experience.
- Multi-step onboarding: strategy → playbook review → first setup → complete
- Middleware: redirect to onboarding if not complete
- Dashboard: playbook status, setup count, last session score, streak counter

---

## What Starts Mock vs Persisted from Day One

### Persisted from the start (Phase 1 onwards)
Every record the user creates is persisted immediately. There is no "local draft" state for core entities. If the trader closes the browser mid-onboarding, their work is not lost.

- User account
- Strategy fields (auto-saved on each step)
- Playbook and Rules
- Setups and SetupExamples
- TrainingSessions, TrainingPrompts, TrainingResponses
- TradeReviews and RuleEntries

### Mock until replaced (Phase 2–4, replaced whenever AI integration is scheduled)
- Playbook generation output (mock: rule extraction from text)
- Session plan generation (mock: shuffle-and-template from existing data)
- Response scoring and feedback (mock: keyword match + template feedback)

### Never persisted (intentional)
- Active training session UI state (prompt index, timer) — lives in React state, reconstructable from DB if session already has persisted prompts
- Annotation tool state while drawing — local until saved
- Form draft state during onboarding — auto-saved to DB on each step transition, no in-memory draft store needed

---

*End of architecture definition. Awaiting approval before any implementation begins.*
