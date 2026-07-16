# Northstar Salary Management - Quick Reference

## Project Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
npm run test         # Run tests
npm run seed         # Seed demo data
```

## Key Files
- `services/employeeService.ts` - Business logic
- `repositories/employeeRepository.ts` - Data access layer
- `types/employee.ts` - Core types
- `app/layout.tsx` - Root layout
- `components/dashboard-shell.tsx` - Dashboard UI

## Development Notes

### Adding New Features
1. Define types in `types/` directory
2. Add repository methods if needed
3. Implement service layer logic
4. Create UI components in `components/` or `features/`
5. Add route handlers in `app/api/` for APIs
6. Create pages in `app/` directory

### Testing Patterns
- Unit tests go in `tests/` directory
- Test service layer independently from UI
- Use demo repository for isolated testing
- Follow Arrange-Act-Assert pattern

### Code Style
- Use TypeScript strict mode
- Prefer functional components
- Use Tailwind CSS for styling
- Follow Next.js App Router conventions
- Use Zod for validation

### Data Access
- Always go through repository layer
- Service layer handles business logic
- Demo data available when Supabase not configured
- Use pagination for large datasets

### Environment Setup
1. Copy `.env.local.example` to `.env.local`
2. Add Supabase credentials (optional)
3. Run `npm install`
4. Run `npm run dev`

## Common Patterns

### Creating a New Service
```typescript
import { createEmployeeService } from "@/services/employeeService";

const employeeService = createEmployeeService();
const employees = await employeeService.listEmployees();
```

### Adding API Route
```typescript
// app/api/your-route/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createEmployeeService } from "@/services/employeeService";

export async function GET(request: NextRequest) {
  const service = createEmployeeService();
  const data = await service.getAnalytics();
  return NextResponse.json(data);
}
```

### Creating UI Component
```tsx
// components/your-component.tsx
"use client";

import { useState, useEffect } from "react";
import { dashboardApi } from "@/lib/client-api";

export function YourComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    dashboardApi.get().then(setData);
  }, []);
  
  return <div>{/* Your JSX */}</div>;
}
```

## Troubleshooting

### Demo Data Issues
- System uses demo data when Supabase not configured
- Demo data generates 48 realistic employee records
- Run `npm run seed` to refresh demo data

### TypeScript Errors
- Run `npx tsc --noEmit` to check types
- Ensure all imports use `@/` alias
- Check `types/` directory for type definitions

### Build Issues
- Clear `.next` directory: `rm -rf .next`
- Clear TypeScript cache: `rm tsconfig.tsbuildinfo`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Performance Tips
- Use pagination for employee lists
- Implement search at service layer
- Cache frequently accessed data
- Use React.memo for expensive components

## Testing Commands
```bash
npm run test           # Run all tests
npm run test -- --ui   # UI test runner
npx vitest run --coverage  # Coverage report
```

## Deployment Checklist
1. Set Supabase environment variables
2. Run `npm run build`
3. Verify TypeScript compilation
4. Run tests
5. Deploy to Vercel