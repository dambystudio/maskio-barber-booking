---
title: 'Remove Nicolò Morning Closures'
slug: 'remove-nicolo-morning-closures'
created: '2026-01-27'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Next.js 15', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'Node.js']
files_to_modify: ['src/app/api/system/daily-update/route.ts', 'src/scripts/delete-nicolo-closures.ts']
code_patterns: ['API Routes', 'Drizzle SQL queries', 'Database Seeding']
test_patterns: ['Manual Verification via Database Query']
---

# Tech-Spec: Remove Nicolò Morning Closures

**Created:** 2026-01-27

## Overview

### Problem Statement

Nicolò is currently showing as "Closed" in the mornings for future dates (e.g., March), despite the intention for him to be open. The logic causing these automatic closures has already been removed from the codebase, but the database still contains pre-generated closure records for future dates created by the daily update job before the code fix.

### Solution

We need to clean up the database by removing the stale "morning" closure records for Nicolò for all future dates. We will create a one-time script to perform this deletion. We will also update the API documentation in `daily-update` to reflect that Nicolò no longer has automatic closures.

### Scope

**In Scope:**
- Create a cleanup script to delete `barber_closures` for Nicolò where type='morning' and date >= today.
- Update `src/app/api/system/daily-update/route.ts` GET response documentation to remove Nicolò's outdated closure rule.

**Out of Scope:**
- Changes to `universal-slots.ts` (already creating correct logic by default).
- Changes to other barbers.

## Context for Development

### Codebase Patterns

- Closures are stored in `barber_closures` table.
- `daily-update` API creates closures based on logic in `universal-slots.ts`.
- Barbers are identified by email in the database logic.

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `src/app/api/system/daily-update/route.ts` | Daily update logic and documentation |
| `src/lib/universal-slots.ts` | Logic that *used* to contain the closure rule |

### Technical Decisions

- **Cleanup Strategy**: We will create a standalone script `src/scripts/delete-nicolo-closures.ts` that uses the existing Drizzle/Neon connection to execute raw SQL.
- **Targeting**: We will target the barber by finding the `id` from the `barbers` table where `email` is associated with Nicolò (found via name search or hardcoded if necessary, but name search is safer).
- **Scope of Deletion**: `DELETE FROM barber_closures WHERE barber_email = (SELECT email FROM barbers WHERE name LIKE '%Nicolò%') AND closure_type = 'morning' AND closure_date >= CURRENT_DATE`.
- **Documentation**: We will remove the reference to Nicolò's automatic closure in the `GET` endpoint of `daily-update` to keep documentation in sync with reality.

## Implementation Plan

### Tasks

- [ ] Task 1: Create cleanup script
  - File: `src/scripts/delete-nicolo-closures.ts`
  - Action: Create a new script that connects to the database, finds Nicolò's email, and deletes all future 'morning' closures. Add logging to report how many records were deleted.
  - Notes: Ensure it requires manual execution (not part of the build).

- [ ] Task 2: Update Daily Update API response
  - File: `src/app/api/system/daily-update/route.ts`
  - Action: Remove the line `nicolo: 'Every day morning'` from the `GET` response object `automaticClosures`.
  - Notes: This is just documentation/status reporting, no logic change.

### Acceptance Criteria

- [ ] AC 1: Given `src/scripts/delete-nicolo-closures.ts` exists, when executed, then it should delete all rows from `barber_closures` where `barber_email` matches Nicolò, `closure_type` is 'morning', and `closure_date` is today or later.
- [ ] AC 2: Given the cleanup script runs successfully, when I query `barber_closures` for Nicolò's morning closures in March, then I should see 0 results.
- [ ] AC 3: Given the updated `daily-update` API, when I call `GET /api/system/daily-update`, then the JSON response should NOT include Nicolò in the `automaticClosures` list.

## Additional Context

### Dependencies

- `dotenv`: To load environment variables for the standalone script (database URL).
- `tsx`: To execute the TypeScript script directly.

### Testing Strategy

- **Manual Verification**:
  1. Run query `SELECT * FROM barber_closures WHERE closure_type='morning' AND barber_email LIKE '%nicolo%' AND closure_date > NOW()` to see current count (expected > 0).
  2. Run the script `npx tsx src/scripts/delete-nicolo-closures.ts`.
  3. Run the verification query again (expected count = 0).
  4. Call the API status endpoint to verify JSON output.

### Notes

- This is a one-time fix. The script can be deleted or archived after use.
