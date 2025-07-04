# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Arknights event video submission system built with Next.js 15, React 19, and Firebase. It collects YouTube video submissions for game events and provides an admin interface for management.

## Development Commands

```bash
# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Code formatting (uses Biome with tab indentation)
npm run format

# Linting (uses Biome)
npm run lint

# Format and lint combined
npm run fix
```

## High-Level Architecture

### Technology Stack
- **Frontend**: Next.js 15.3.1 with React 19, TypeScript
- **UI Library**: Ant Design v5 with React 19 patch
- **Styling**: TailwindCSS
- **Database**: Firebase Firestore (client SDK)
- **Authentication**: JWT-based admin auth using `jose` library
- **Code Quality**: Biome for formatting/linting (replaces ESLint/Prettier)

### Project Structure Patterns

The project follows Atomic Design principles:
- **Atoms** (`/components/atoms/`): Basic form components (FormButton, FormInput, etc.)
- **Molecules** (`/components/molecules/`): Field components (YoutubeUrlField, ConceptField, etc.)
- **Organisms** (`/components/organisms/`): Complex components (VideoSubmissionForm, EventSubmissionGuidelines)
- **Templates** (`/components/templates/`): Layout components (FormLayout)

### Key Architectural Decisions

1. **Server-Side Firebase Operations**: All Firebase operations go through Next.js API routes. Never access Firebase directly from client components.

2. **Path Aliases**: Use `@/` for imports (maps to `src/`):
   ```typescript
   import { FormLayout } from "@/components/templates";
   ```

3. **Event Pages Pattern**: Each event (AS, EP, GO, PV) has:
   - Main submission page: `/app/[event]/page.tsx`
   - Calculator page: `/app/[event]/calculate/page.tsx`

4. **Authentication Flow**:
   - Admin login at `/admin/login`
   - JWT stored in HTTP-only cookie
   - Middleware protects `/admin/*` routes
   - Single admin password (no user management)

### API Routes

- `POST /api/submissions` - Create new submission
- `GET /api/submissions` - List all submissions
- `DELETE /api/submissions/[id]` - Delete submission (admin only)
- `POST /api/admin/auth` - Admin login
- `GET /api/admin/auth/check` - Verify auth status

### Data Model

Submissions follow this structure:
```typescript
{
  youtubeUrl: string;      // Required, validated YouTube URL
  concept: string;         // Required, max 50 chars
  hasEditing: "edited" | "raw";
  stage: string;           // Event-specific stages
  difficulty: "normal" | "challenge";
  twitterHandle?: string;  // Optional
  doctorHistory: string;   // Experience level enum
  introduction?: string;   // Optional, max 50 chars
  createdAt: Date;
}
```

### Component Conventions

1. **Client Components**: Use `"use client"` directive
2. **Ant Design Patch**: Import `@ant-design/v5-patch-for-react-19` in client components
3. **Form Validation**: Use Ant Design Form with custom validators in `/utils/validators.ts`
4. **Typography**: Use Ant Design Typography components for text
5. **Error Handling**: Show user-friendly messages with Ant Design message component

### Firebase Security

- Firestore rules enforce create-only submissions (no client updates/deletes)
- Required field validation at database level
- Public read access, authenticated write access
- Admin operations through authenticated API routes only

### Environment Variables

Required in `.env.local`:
```
JWT_SECRET=your-secret-key
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Code Style

- **Indentation**: Tabs (enforced by Biome)
- **Quotes**: Double quotes for strings
- **Imports**: Organized automatically by Biome
- **Components**: Functional components with TypeScript
- **File Naming**: PascalCase for components, camelCase for utilities