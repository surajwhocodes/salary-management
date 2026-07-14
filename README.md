# Northstar Salary Management

## Project Overview

Northstar Salary Management is a startup-grade HR platform for managing employee compensation data across countries and departments. It focuses on salary visibility, auditability, and analytics for HR managers and admins.

## Architecture

- Next.js App Router for the UI and routes
- TypeScript for safe domain modeling
- Services and repositories keep business logic separate from UI
- Leaf-level validation uses Zod
- Demo data and seed scripts support local development and showcases

## Setup

1. Install dependencies with npm install
2. Copy `.env.local.example` to `.env.local` and add Supabase credentials (optional for demo mode)
3. Run npm run dev
4. Visit http://localhost:3000

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Development

- npm run seed creates or updates 10,000 realistic Supabase employee records
- npm run test runs Vitest
- npm run lint runs ESLint

## Testing

- Unit tests cover the employee service
- Validation and domain logic remain isolated from UI components
- `npx tsc --noEmit` verifies the strict TypeScript boundary

## Deployment

- Deploy the app to Vercel
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Run `supabase/schema.sql` in the Supabase SQL editor, then run `npm run seed`

## Tradeoffs

- The current implementation favors a maintainable startup architecture over a full enterprise payroll engine
- Local seed data is used for demos and development before full Supabase connectivity is configured

## Future Improvements

- Prisma schema and migration workflow
- CSV import workflows and audit-log persistence
- Role-based access control expansion

## AI Usage

The AI insights page uses deterministic, query-style summaries built from local demo data instead of calling OpenAI.

## Product Scope

- Employee CRUD and salary workflows
- Analytics and dashboard KPIs
- Search, pagination, and CSV-style exports
- A foundation for Supabase-backed auth and role policies
