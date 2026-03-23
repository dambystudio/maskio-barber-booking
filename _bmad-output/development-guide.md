# Development Guide

## Prerequisites

- **Node.js**: v20+ (Recommended for Next.js 15)
- **Package Manager**: npm
- **Database**: PostgreSQL (Local or Cloud/Neon)

## Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   # or if using legacy per package.json script:
   npm run vercel-install
   ```
3. Set up environment variables:
   - Copy `.env.example` (if exists) or ensure `.env.local` is configured with:
     - `DATABASE_URL` (PostgreSQL connection)
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL`
     - `GOOGLE_CLIENT_ID` / `SECRET` (for Auth)
     - `RESEND_API_KEY` (for Emails)

## Development Commands

- **Start Dev Server**:
  ```bash
  npm run dev
  ```
  Runs on `http://localhost:3000`.

- **Build for Production**:
  ```bash
  npm run build
  ```

- **Production Start**:
  ```bash
  npm run start
  ```

- **Linting**:
  ```bash
  npm run lint
  ```

## Database Management (Drizzle ORM)

- **Generate Migrations** (after changing `schema.ts`):
  ```bash
  npm run db:generate
  ```

- **Run Migrations** (apply to DB):
  ```bash
  npm run db:migrate
  ```

- **Push Schema directly** (Prototyping):
  ```bash
  npm run db:push
  ```

- **Open Drizzle Studio** (GUI for DB):
  ```bash
  npm run db:studio
  ```

## Testing

No specific test framework (Jest/Vitest) detected in `package.json` scripts, but `scripts-test` folder exists in root, suggesting manual or script-based testing.
