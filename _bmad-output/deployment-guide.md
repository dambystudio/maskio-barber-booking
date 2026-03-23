# Deployment Guide

## Infrastructure

- **Platform**: Vercel (Recommended for Next.js)
- **Database**: PostgreSQL (Neon / Vercel Postgres)
- **Edge Functions**: Supported (middleware, API routes)

## Configuration

The project includes `vercel.json` and `next.config.ts`.

### Environment Variables

Required in Production (Vercel Project Settings):

- `DATABASE_URL`: Connection string to PostgreSQL.
- `NEXTAUTH_SECRET`: Random string for session encryption.
- `NEXTAUTH_URL`: Canonical URL of the site.
- `RESEND_API_KEY`: For email delivery.
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`: For Web Push notifications.
- `TWILIO_ACCOUNT_SID` / `AUTH_TOKEN`: If SMS is used.

## Deployment Process

1. **Push to Git**: Vercel automatically deploys main branch.
2. **Build Command**: `next build` (Standard).
3. **Output**: `.next` folder.

## Database Migrations

Ensure migrations (`npm run db:migrate`) are run during the build process or via a separate CI/CD step / manual command before deploying schema changes.
