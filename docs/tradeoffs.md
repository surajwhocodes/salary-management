# Tradeoffs

## Why a service/repository split

The app uses a thin UI layer and explicit services/repositories so the same business rules can work for local demo data, Supabase, or later API integrations without major rewrites.

## Why local seed data is included

Seeding realistic demo data enables product demos and local development even before remote services are configured. It is intentionally isolated behind a data source abstraction so the same UI works against Supabase later.

## Why not use a full enterprise payroll engine

The scope is HR salary management rather than full payroll execution. A lightweight, maintainable layer is faster to ship and easier to reason about for a startup MVP.

## Why Zod schemas are central

Validation is enforced at the boundary for forms, APIs, and imports. That reduces invalid data entering the system and keeps the app easier to evolve.

## Future evolution

The current implementation is intentionally opinionated toward clarity and velocity. As the product grows, the repository layer can be swapped for Supabase clients and SQL queries without changing the core domain services.
