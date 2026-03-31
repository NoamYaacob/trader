# Trader — AI Strategy Training Platform

A premium AI-powered strategy training platform for traders. Traders define their strategy in plain language, the platform converts it into a structured playbook, and coaches them through execution training sessions.

---

## Local setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (local install or Docker — see quickstart below)
- npm

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in the two required values:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and set:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/trader"
AUTH_SECRET="<run: openssl rand -base64 32>"
```

Everything else is pre-set for local development (mock AI, localhost URL).

### 3. Set up the database

First-time setup — applies all migrations and seeds the admin user:

```bash
npm run db:setup
```

### 4. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Admin access

Seeded by `db:setup` / `db:reset`:

| Field    | Value               |
|----------|---------------------|
| Email    | `admin@local.test`  |
| Password | `Admin123!ChangeMe` |
| URL      | `/admin`            |

---

## Database commands

| Command             | What it does                                                    |
|---------------------|-----------------------------------------------------------------|
| `npm run db:migrate` | `prisma migrate dev` — apply pending migrations, create new ones if schema changed (interactive, dev only) |
| `npm run db:deploy`  | `prisma migrate deploy` — apply pending migrations non-interactively (CI / production) |
| `npm run db:seed`    | Run the seed script (idempotent — safe to re-run)              |
| `npm run db:setup`   | `db:deploy` + `db:seed` — full first-time setup                |
| `npm run db:reset`   | Drop all data, re-apply all migrations, re-seed (destructive)  |
| `npm run db:studio`  | Open Prisma Studio in the browser                              |

### When to use which command

- **First-time local setup:** `npm run db:setup`
- **After pulling schema changes:** `npm run db:migrate`
- **Full local reset (wipe all data):** `npm run db:reset`
- **CI / staging deploy:** `npm run db:deploy && npm run db:seed`

---

## Optional: real AI provider

The app works fully with the built-in mock provider (no key required). To enable Claude for real playbook generation, add to `.env.local`:

```
AI_PROVIDER="anthropic"
ANTHROPIC_API_KEY="sk-ant-..."
```

Default model: `claude-haiku-4-5-20251001`. Override with `ANTHROPIC_MODEL`.

---

## Quick Docker Postgres

If you don't have Postgres installed locally:

```bash
docker run --name trader-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=trader \
  -p 5432:5432 \
  -d postgres:15
```

Then use `DATABASE_URL="postgresql://postgres:password@localhost:5432/trader"` in `.env.local`.
