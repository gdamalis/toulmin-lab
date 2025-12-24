# Toulmin Lab - AI Agent Instructions

## Project Overview
Toulmin Lab is a Next.js 15 application for creating Toulmin argument diagrams with AI-assisted generation. It uses a dual authentication system (Firebase Auth + NextAuth.js), MongoDB for persistence, and @xyflow/react for diagram visualization.

## Architecture

### Route Groups (App Router)
- `(public)/` - Unauthenticated routes (landing, `/auth`)
- `(user)/` - Authenticated user routes (`/dashboard`, `/argument/*`)
- `(admin)/` - Admin-only routes (`/admin/*`)
- `api/` - REST API endpoints with standardized responses

### Key Data Flow
1. **Authentication**: Firebase Auth → NextAuth.js session → `AuthContext` → API calls with Bearer tokens
2. **AI Generation**: `/api/ai/generate` → `src/lib/services/ai` → Gemini provider → Toulmin argument
3. **Arguments**: React hooks (`useArguments`) → `/api/argument` → MongoDB (`src/lib/mongodb/`)

### Domain Types
Toulmin arguments have 7 parts defined in `src/types/toulmin.ts`:
- `claim`, `grounds`, `groundsBacking`, `warrant`, `warrantBacking`, `qualifier`, `rebuttal`

## Code Patterns

### API Routes
Use the `withAuth`/`withAdminAuth` wrappers and standardized responses:
```typescript
// src/app/api/example/route.ts
import { withAuth } from "@/lib/api/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/responses";

export async function GET(request: NextRequest, context: { params: Promise<...> }) {
  return withAuth(async (request, context, auth) => {
    // auth.userId, auth.role, auth.isAdmin available
    return createSuccessResponse({ data });
  })(request, context);
}
```

### Validation
Use Zod schemas in `src/lib/validation/` - see `ai.ts` for patterns:
```typescript
const schema = z.object({ prompt: z.string().min(10).max(2000) });
```

### Components
- Use `class-variance-authority` (cva) for variant styling (see `src/components/ui/Button.tsx`)
- Use `cn()` from `src/lib/utils.ts` for className merging
- Prefer Server Components; add `'use client'` only when needed
- Wrap client components with proper `Readonly<>` types

### Hooks
Client-side data fetching follows this pattern (see `src/hooks/useArguments.ts`):
- Get token via `getCurrentUserToken()` from `@/lib/auth/utils`
- Call API with `Authorization: Bearer ${token}` header
- Use `useNotification()` for error feedback

## Developer Workflows

### Commands
```bash
npm run dev          # Development with Turbopack
npm run emulators    # Firebase emulators (auth data in ./emulator-data)
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
```

### Commits
Conventional commits enforced via commitlint. Header max 100 chars:
```
feat: add argument export
fix(diagram): correct node positioning
```

### Roles
Defined in `src/types/roles.ts`: `USER`, `STUDENT`, `BETA_TESTER`, `PROFESSOR`, `ADMINISTRATOR`
Use helper functions: `isAdmin()`, `isProfessor()`, `canCreateArguments()`

## Internationalization
- Locales: `en`, `es` (see `src/i18n/settings.ts`)
- Messages in `messages/{locale}.json`
- Use `useTranslations()` hook from `next-intl`

## Key Files Reference
| Purpose | Location |
|---------|----------|
| Auth context & state | `src/contexts/AuthContext.tsx` |
| Route protection | `src/middleware.ts` |
| API auth middleware | `src/lib/api/auth.ts` |
| MongoDB service | `src/lib/mongodb/service.ts` |
| AI providers | `src/lib/ai/providers/` |
| Diagram component | `src/components/diagram/ToulminDiagram.tsx` |
| Type definitions | `src/types/` |
| UI components | `src/components/ui/` |
