# AGENTS.md — AI Strategy Training Platform

This document defines the engineering principles, architectural conventions, design rules, and workflow standards for this project. All contributors and AI agents must read and follow this file before writing any code.

---

## 1. Product Overview

This is a **premium AI-powered strategy training platform for traders**.

It is not a trading journal. It is not a generic SaaS product. It is a focused, serious tool that helps traders:

- Teach the system their strategy using plain language, screenshots, and annotations
- Convert that input into a structured **playbook** and **setup library**
- Train their execution through personalized **coaching sessions**
- Reinforce discipline and consistent rule-following over time

The product must feel premium, practical, and visually impressive at every touchpoint. Every screen, interaction, and piece of copy should reflect the mindset of a serious, professional trader.

---

## 2. Technical Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Animation | Framer Motion |
| ORM | Prisma |
| Database | PostgreSQL |

No exceptions to this stack without explicit discussion and documented justification.

---

## 3. Engineering Rules

### 3.1 Language
- All code, comments, filenames, variable names, and internal documentation must be written in **English only**.
- No localized variable names, no mixed-language comments.

### 3.2 Architecture
- Maintain a strict **three-layer separation**:
  - **UI layer** — React components, pages, layouts, animations. No direct DB calls.
  - **Domain layer** — Business logic, validation, state transformations. No Prisma imports.
  - **Data access layer** — Prisma queries, DB interactions. No business logic.
- Cross-layer imports are prohibited. Data flows down: UI → Domain → Data.
- Use `src/` as the project root with the following top-level directories:

```
src/
  app/          # Next.js App Router pages and layouts
  components/   # Reusable UI components
  features/     # Feature-scoped modules (each contains ui/, domain/, data/)
  lib/          # Shared utilities, constants, config
  server/       # Server actions and API route handlers
  db/           # Prisma client, schema, migrations
  types/        # Shared TypeScript types and interfaces
  hooks/        # Custom React hooks
  styles/       # Global styles, Tailwind config extensions
```

### 3.3 TypeScript
- `strict: true` in `tsconfig.json`. No exceptions.
- No `any`. Use `unknown` and narrow properly.
- Define explicit return types on all functions exported from domain and data layers.
- Co-locate types with the feature they belong to; only promote to `src/types/` when genuinely shared.

### 3.4 Component Design
- All components are **functional**. No class components.
- Props interfaces are always explicitly typed and named `[ComponentName]Props`.
- Keep components small and focused. If a component exceeds ~150 lines, decompose it.
- Client components are explicitly marked with `"use client"`. Default to server components.
- Animations are handled exclusively by **Framer Motion**. Do not use CSS keyframes for UI transitions.

### 3.5 Data Access
- All database access goes through Prisma. No raw SQL unless absolutely necessary, and if used, it must be documented with a comment explaining why.
- The Prisma client is instantiated once in `src/db/client.ts` and imported from there.
- Never expose Prisma types directly to the UI layer. Use explicit mapped types.

### 3.6 Dependencies
- Do not add a dependency that can be replaced with a small utility function.
- Every new dependency requires a brief justification comment in `package.json` or a note in the relevant feature README.
- Prefer well-maintained, type-safe packages.

### 3.7 Error Handling
- Use typed error results (e.g., `{ success: true, data } | { success: false, error }`) at domain and data layer boundaries.
- Never `throw` from data access functions — return structured errors.
- Client-side errors are handled gracefully with user-facing feedback. No silent failures.

---

## 4. Design Rules

### 4.1 Core Aesthetic
- **Dark-mode-first.** The default experience is dark. Light mode may be considered later but is not a current requirement.
- **Premium, sharp, and minimal.** Every component should feel like it was designed specifically for this product, not copied from a template.
- **Serious trader aesthetic.** Think professional terminal meets modern design system. No rounded-everything, no pastel gradients, no playful illustrations.
- **Not generic SaaS.** Avoid patterns that look like they belong on a landing page builder or a to-do app.
- **Not cluttered.** White space is not wasted space. Dense information must be organized, not crammed.

### 4.2 Color
- Base palette is dark neutrals (near-black backgrounds, dark gray surfaces).
- Use a single strong accent color for primary actions and highlights. Default: a sharp, clean blue or amber — finalize in the design token file before building components.
- Text uses a clear hierarchy: primary (high contrast), secondary (muted), disabled (very muted).
- Status colors (profit/loss, success/warning/error) must be distinct and immediately readable.

### 4.3 Typography
- Use a single, high-quality monospace or geometric sans-serif font.
- Establish a strict type scale. Do not introduce ad-hoc font sizes — use Tailwind's configured scale only.
- Numbers (P&L, stats, prices) must always render in a monospace or tabular-figures font.

### 4.4 Motion
- Animation should feel purposeful and fast. Nothing slow or decorative for its own sake.
- Use Framer Motion variants for consistent enter/exit patterns across the UI.
- Default transition duration: 150–200ms for micro-interactions, 250–350ms for page/panel transitions.
- Avoid animation on elements that update frequently (e.g., live price data).

### 4.5 Components
- Use **shadcn/ui** as the component foundation. Customize aggressively to match the design system — do not use shadcn defaults unstyled.
- Every shadcn component used must be reviewed and adapted before being used in a feature.

---

## 5. Workflow Rules

### 5.1 Before Starting Any Major Feature
1. Write a short plan (what you are building, why, key decisions).
2. Identify which files will be created or modified.
3. Note any architectural decisions and their rationale.
4. Get confirmation before writing code if the scope is large or the approach is non-obvious.

### 5.2 Commits
- Commit early and often. Every commit must leave the codebase in a working state.
- Use conventional commit format:
  - `feat: add playbook creation flow`
  - `fix: correct setup card hover state`
  - `refactor: extract trade annotation domain logic`
  - `chore: update Prisma schema for setup library`
  - `docs: add architecture note for data layer`
- Never commit broken builds, failing type checks, or unused dead code.

### 5.3 Git Hygiene
- Feature branches branch off `main`. Name format: `feat/short-description`.
- Do not force-push to shared branches.
- Keep the repository recoverable at all times. Do not squash commits mid-feature without explicit review.

### 5.4 Verification Steps
- After any major feature: verify TypeScript compiles cleanly (`tsc --noEmit`).
- After any DB schema change: verify Prisma migration generates cleanly and the client regenerates.
- After any UI work: manually verify the feature renders correctly in the dark theme.
- Before committing: confirm no `any` escapes, no unused imports, no console.log left in production paths.

### 5.5 AI Agent Behavior
- An AI agent working on this project must read this file before writing any code.
- When the task is ambiguous, the agent must ask for clarification rather than assume.
- When making an architectural decision, the agent must state the decision and rationale before implementing it.
- An agent must never introduce a new dependency, change the folder structure, or deviate from the stack without surfacing it as a proposal first.
- An agent must not clean up, refactor, or extend code beyond the explicit scope of the current task.

---

## 6. Feature Conventions

Each feature lives in `src/features/[feature-name]/` and follows this internal structure:

```
features/
  playbook/
    ui/         # React components specific to this feature
    domain/     # Business logic, validation, transformations
    data/       # Prisma queries for this feature
    types.ts    # Types scoped to this feature
    index.ts    # Public API — only export what other features need
```

Features must not import directly from each other's internals. Cross-feature communication happens through `index.ts` exports only.

---

## 7. Key Product Concepts (Domain Language)

Use these terms consistently in code, types, and comments:

| Term | Meaning |
|---|---|
| `Strategy` | The trader's overall trading approach, defined in their own words |
| `Playbook` | The structured, AI-generated version of the strategy |
| `Setup` | A specific, repeatable trade configuration that matches the strategy |
| `Annotation` | A trader's note or markup on a trade screenshot |
| `Session` | A coaching/training session driven by the platform |
| `Review` | Post-trade analysis against the playbook |
| `Rule` | A concrete constraint or condition from the trader's strategy |

These terms map directly to Prisma models and TypeScript types. Do not invent synonyms.

---

## 8. What This Project Is Not

To keep scope and quality in focus, explicitly out of scope unless decided otherwise:

- A generic trading journal or trade logger
- A brokerage integration or live data feed
- A social/community platform
- A mobile-first product
- A multi-tenant SaaS with self-serve billing (initially)

If a feature request touches one of these areas, flag it before building.
