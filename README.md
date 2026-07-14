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
2. Run npm run dev
3. Visit http://localhost:3000

## Development

- npm run seed seeds demo employees
- npm run test runs Vitest
- npm run lint runs ESLint

## Testing

- Unit tests cover the employee service
- Validation and domain logic remain isolated from UI components

## Deployment

- Deploy the app to Vercel
- Set environment variables for Supabase or other data providers when ready

## Tradeoffs

- The current implementation favors a maintainable startup architecture over a full enterprise payroll engine
- Local seed data is used for demos and development before full Supabase connectivity is configured

## Future Improvements

- Supabase auth and RLS integration
- Prisma schema and migration workflow
- CSV import/export flows and audit log persistence
- Role-based access control expansion

## AI Usage

The AI insights page uses deterministic, query-style summaries built from local demo data instead of calling OpenAI.

## Product Scope

- Employee CRUD and salary workflows
- Analytics and dashboard KPIs
- Search, pagination, and CSV-style exports
- A foundation for Supabase-backed auth and role policies
