# Trader — AI Strategy Training Platform

A premium AI-powered strategy training platform for traders. Traders define their strategy in plain language, the platform converts it into a structured playbook, and coaches them through execution training sessions.

---

## Local development setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ running locally (or via Docker)
- npm

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

A pre-filled `.env.local` is created for you by default with a generated `AUTH_SECRET` and safe defaults. You only need to update one value:

```bash
# Open .env.local and replace the DATABASE_URL placeholder:
DATABASE_URL="postgresql://postgres:password@localhost:5432/trader"
```

Everything else works out of the box for local development:
- `AUTH_SECRET` is already generated
- `AUTH_URL` defaults to `http://localhost:3000`
- AI defaults to the built-in mock provider (no API key required)

See `.env.local.example` for all available options.

### 3. Set up the database

Push the schema and seed the admin user in one command:

```bash
npm run db:setup
```

This runs `prisma db push` (creates all tables) then `prisma db seed` (creates the admin user).

### 4. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Admin access

A seeded admin account is created by `db:setup`:

| Field    | Value                  |
|----------|------------------------|
| Email    | `admin@local.test`     |
| Password | `Admin123!ChangeMe`    |

Admin panel is at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## Database commands

| Command            | Description                                        |
|--------------------|----------------------------------------------------|
| `npm run db:push`  | Sync schema to the database (no data loss)         |
| `npm run db:seed`  | Run the seed script (idempotent — safe to re-run)  |
| `npm run db:setup` | `db:push` + `db:seed` — full first-time setup      |
| `npm run db:reset` | Drop all data, re-push schema, re-seed             |
| `npm run db:studio`| Open Prisma Studio in the browser                  |

---

## Optional: real AI provider

The app works fully with the mock AI provider (no key required). To enable Claude for real playbook generation, add to `.env.local`:

```
AI_PROVIDER="anthropic"
ANTHROPIC_API_KEY="sk-ant-..."
```

The model defaults to `claude-haiku-4-5-20251001`. Override with `ANTHROPIC_MODEL`.

---

## Quick Docker Postgres (if you don't have Postgres locally)

```bash
docker run --name trader-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=trader \
  -p 5432:5432 \
  -d postgres:15
```

Then set `DATABASE_URL="postgresql://postgres:password@localhost:5432/trader"` in `.env.local`.
