# Source Tree Analysis

## Project Structure

**Root**: `/`
**Type**: Monolith (Next.js Web Application)

### Critical Directories

```
maskio-barber/
├── src/
│   ├── app/                 # Next.js App Router (Pages & API)
│   │   ├── api/             # API Route Handlers (Backend logic)
│   │   │   ├── auth/        # NextAuth endpoints
│   │   │   ├── bookings/    # Booking management endpoints
│   │   │   └── ...          # Feature-based API routes
│   │   ├── components/      # (If shared app components exist here)
│   │   └── page.tsx         # Home page
│   ├── components/          # Reusable UI Components
│   │   ├── BookingForm.tsx  # Core booking logic
│   │   └── ...
│   ├── lib/                 # Shared utilities and configuration
│   │   ├── schema.ts        # Database Schema (Drizzle/PostgreSQL)
│   │   ├── auth.ts          # NextAuth configuration
│   │   ├── database*        # Database connection helpers
│   │   └── email.ts         # Email service logic
│   └── styles/              # Global styles (globals.css)
├── drizzle/                 # Database Migrations folder
├── public/                  # Static assets (images, icons)
├── scripts/                 # Maintenance and utility scripts
├── md-file/                 # Extensive legacy documentation
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── drizzle.config.ts        # Drizzle ORM configuration
└── package.json             # Project dependencies and scripts
```

## Key Entry Points

- **Frontend**: `src/app/page.tsx` (Main landing page), `src/app/layout.tsx` (Root layout).
- **Backend**: `src/app/api/` (API Routes).
- **Database**: `src/lib/schema.ts` (Schema definition), `drizzle.config.ts`.
- **Auth**: `src/app/api/auth/[...nextauth]/route.ts`.

## Integration Points

- **Database**: Connects to PostgreSQL (Neon/Vercel Postgres) via Drizzle ORM.
- **Email**: Uses Resend (inferred from `package.json` and typical stack) or similar service via `EmailService`.
- **SMS/Push**: Twilio / Web Push integration visible in `package.json` and component names.
