# Northstar Salary Management System - Context Documentation

## Project Overview
Northstar Salary Management is a startup-grade HR platform for managing employee compensation data across countries and departments. It focuses on salary visibility, auditability, and analytics for HR managers and admins.

## Technology Stack
- **Framework**: Next.js 16.2.10 with App Router
- **Language**: TypeScript with strict typing
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Testing**: Vitest
- **Database**: Supabase (PostgreSQL) with demo fallback
- **Validation**: Zod schemas
- **UI Components**: Custom component library with Lucide React icons
- **State Management**: React hooks and context

## Architecture Principles
1. Business logic in services and repositories
2. UI components small and reusable
3. Typed schemas and explicit interfaces
4. Deployable on Vercel with Supabase-ready data layer

## Key Directories Structure
```
app/                # Route handlers and pages
├── account/        # User account management
├── analytics/      # Analytics dashboard
├── api/            # API routes
├── employees/      # Employee management pages
├── login/          # Authentication
└── page.tsx        # Homepage (dashboard)

components/         # Shared UI building blocks
├── ui/             # Base UI components (card, etc.)
├── dashboard-shell.tsx  # Dashboard component
└── header.tsx      # Navigation header

features/           # Domain-specific feature modules
lib/                # Shared configuration and utilities
services/           # Business use cases
repositories/       # Data access layer
types/              # Shared TypeScript types
utils/              # Helpers and formatting
tests/              # Unit, integration, and E2E tests
supabase/           # SQL helpers and migrations
scripts/            # Seeding and maintenance scripts
```

## Core Business Logic

### Employee Service (`services/employeeService.ts`)
Provides comprehensive employee management functionality:
- CRUD operations for employees
- Search and filtering capabilities
- Bulk salary updates
- Analytics and insights generation
- Employee summary statistics
- CSV export functionality

### Employee Repository (`repositories/employeeRepository.ts`)
Data access layer with dual implementation:
1. **SupabaseEmployeeRepository**: Production-ready Supabase integration
2. **DemoEmployeeRepository**: In-memory demo data for development/testing

### Employee Types (`types/employee.ts`)
```typescript
export interface Employee {
    id: string;
    employeeId: string;  // Format: "NST-XXXXX"
    firstName: string;
    lastName: string;
    email: string;
    department: string;  // Engineering, Product, Marketing, Finance, People, Operations
    country: string;     // United States, India, UK, Germany, Canada, Australia
    currency: string;    // USD, INR, GBP, EUR, CAD, AUD
    joiningDate: string; // YYYY-MM-DD
    employmentType: "Full-Time" | "Part-Time" | "Contract";
    status: "Active" | "On Leave" | "Terminated";
    baseSalary: number;
    bonus: number;
    allowance: number;
    tax: number;
    netSalary: number;   // baseSalary + bonus + allowance - tax
    manager: string;
    lastUpdated: string; // YYYY-MM-DD
}
```

## Key Features

### 1. Dashboard
- Real-time analytics and employee statistics
- Country and department distribution charts
- Recent salary change tracking
- Compensation trend analysis
- AI-generated insights

### 2. Employee Management
- Searchable employee directory
- Pagination support
- Employee detail view
- Salary adjustment workflows
- CSV import/export capabilities

### 3. Analytics
- Department-wise salary analysis
- Country distribution visualization
- Payroll cost calculations
- Salary benchmarking

### 4. Authentication
- Supabase-based authentication
- Protected routes
- Role-based access control (foundation)
- Session management

## Data Flow
```
User → UI Component → Service Layer → Repository Layer → Database
                                     ↓
                               Demo Data (fallback)
```

## Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Vitest tests
npm run seed         # Seed database with demo data
```

## Environment Configuration
Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

If Supabase credentials are not provided, the system falls back to in-memory demo data.

## Testing Strategy
- Unit tests cover employee service logic
- Validation and domain logic isolated from UI
- TypeScript compiler verification (`tsc --noEmit`)
- Vitest for test execution

## Future Roadmap
1. Prisma schema and migration workflow
2. CSV import workflows and audit-log persistence
3. Role-based access control expansion
4. Enhanced analytics and reporting
5. Multi-tenant architecture support

## Important Design Decisions

### 1. Repository Pattern
- Abstracts data persistence layer
- Allows switching between Supabase and demo data
- Makes business logic testable

### 2. Service Layer
- Contains all business rules
- Validates inputs using Zod schemas
- Handles complex operations like bulk updates

### 3. Type Safety
- Strict TypeScript configuration
- Zod validation at service boundaries
- Explicit interfaces for all data structures

### 4. Responsive Design
- Mobile-first approach
- Tailwind CSS for styling
- Accessible components with keyboard support

## Performance Considerations
- Pagination for large datasets (10,000+ employees)
- Efficient filtering and search algorithms
- Optimized chart rendering with Recharts
- Lazy loading for dashboard components

## Security Features
- Input validation with Zod
- Protected API routes
- Secure authentication flow
- Environment variable management

## Demo Data
System includes realistic demo data for:
- 48 employees across 6 countries
- Multiple departments (Engineering, Product, etc.)
- Varying salary ranges and compensation structures
- Realistic names and email addresses

## Integration Points
1. Supabase for authentication and database
2. Recharts for data visualization
3. Lucide React for icons
4. Tailwind CSS for styling
5. Zod for validation

## File References
- `#[[file:docs/requirements.md]]` - Detailed requirements
- `#[[file:docs/architecture.md]]` - System architecture
- `#[[file:docs/performance.md]]` - Performance considerations
- `#[[file:docs/tradeoffs.md]]` - Design tradeoffs
- `#[[file:docs/ai-prompts.md]]` - AI integration patterns