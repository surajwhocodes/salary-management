# Performance Plan

## Goals

- Support 10,000 employees without loading all records into memory
- Keep list and analytics views responsive
- Use server components and paginated queries where possible

## Strategy

- Paginate employee and salary list views
- Use indexed filters for department, country, and status
- Introduce server-side caching for dashboard summaries
- Lazy load charts and heavy UI sections
- Prefer aggregate SQL queries for analytics and insights

## Monitoring

- Measure page render time for dashboard and employee list
- Track CSV import durations
- Watch database query latency for analytics endpoints
