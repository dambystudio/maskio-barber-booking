---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
inputDocuments:
  - _bmad-output/project-overview.md
  - _bmad-output/api-contracts.md
  - _bmad-output/data-models.md
  - _bmad-output/component-inventory.md
  - _bmad-output/source-tree-analysis.md
  - _bmad-output/deployment-guide.md
  - _bmad-output/development-guide.md
documentCounts:
  briefCount: 0
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 7
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: brownfield
workflowType: 'prd'
---

# Product Requirements Document - Maskio Barber Booking (Refactor)

**Author:** Damby
**Date:** 2026-01-24
**Status:** Approved for Implementation

## 1. Problem Statement & Context
The current application suffers from critical performance and stability bottlenecks that risk system reliability during high-traffic periods (e.g., holidays).
- **Performance:** `DatabaseService.getBookingStats` calculates statistics using in-memory array manipulation, causing slow response times and memory pressure.
- **Security:** Rate limiting relies on local memory (`Map`), which is ineffective and inconsistent in serverless environments like Vercel.
- **Efficiency:** Slot generation logic uses synchronous blocking loops, potentially freezing the event loop under load.

## 2. Success Criteria

### User Success
- **Speed:** Booking calendar and slots load effectively instantly (target < 200ms).
- **Reliability:** Service remains available with zero downtime/errors during peak booking windows.

### Business Success
- **Stability:** Elimination of Out-Of-Memory errors; constant resource usage regardless of user load.
- **Fairness:** Robust rate limiting prevents automated scripts from hoarding slots, ensuring equal access for real customers.

### Technical Metrics
- **Latency:** API p95 response time < 200ms for all read operations.
- **Efficiency:** Database queries use `COUNT`/`SUM` aggregation instead of full table scans.
- **Security:** Rate limiting state is persisted externally (Redis/KV).

## 3. User Journeys

### The "Christmas Rush" Customer (Speed)
Marco opens the app during the holiday rush. Last year, the booking page timed out. This year, despite high traffic, the calendar loads instantly (< 200ms). He selects his 17:00 slot immediately. No spinners, no errors. He books his cut and leaves satisfied.

### The "Fairness" Check (Bot Defense)
A scalper script attempts to reserve all 20 New Year's Eve slots in 1 second. The new Redis-backed middleware checks the IP velocity across all serverless instances and blocks the bot's 2nd request immediately. The slots remain open for real humans like Marco.

### The "Sleepy Dev" (Stability)
On Christmas Eve, traffic spikes 5x above normal. The developer checks the monitoring dashboard. Instead of the dangerous sawtooth memory pattern from last year, memory usage is flat and stable thanks to proper SQL aggregation. The system runs on autopilot.

## 4. Scope & Phased Development

### MVP Strategy: "Refactoring & Solidity First"
**Goal:** Establish a rock-solid foundation by fixing performance and security flaws before adding new features.
**Focus:** Performance optimization, stateless security, and offline resilience (PWA).

### Phase 1: MVP Feature Set (Immediate)
1.  **DB Optimization:** Refactor `getBookingStats` to use optimized SQL `COUNT`/`SUM` queries.
2.  **Slot Optimization:** Efficiency refactor of `generateStandardSlots` (non-blocking/memoized).
3.  **Rate Limiting:** Migrate middleware to use a distributed store (Redis via Vercel KV).
4.  **PWA Offline:** Implement "Offline Fallback" screen and cached booking view for disconnected users.
5.  **SEO:** Add basic meta tags (Title, Description) for public pages.

### Phase 2: Growth (Backlog)
- Advanced Analytics Dashboard (Graphs, Year-over-Year trends).
- Complex Notification System (SMS/WhatsApp integration).
- Native App Packaging (Capacitor/Expo).

### Risk Mitigation
- **Technical:** Redis connection latency in serverless functions.
  - *Mitigation:* Use HTTP-based Redis client (Upstash/Vercel KV) to avoid connection pool overhead.
- **Regression:** Breaking complex slot generation logic during refactor.
  - *Mitigation:* Implement strict unit tests for `generateStandardSlots` BEFORE starting the refactor.

## 5. Functional Requirements (Capability Contract)

### Booking & Availability
- **FR1:** Customer can view available booking slots for a selected date and barber.
- **FR2:** System must generate booking slots using non-blocking logic to prevent UI freeze.
- **FR3:** Customer sees a cached view of available slots if internet connection is lost (if already loaded).
- **FR4:** Customer sees a friendly "Offline" message when attempting to book without an active connection.

### Admin & Analytics
- **FR5:** Admin can view "Total Bookings", "Confirmed Bookings", and "Revenue" on the dashboard.
- **FR6:** System must calculate dashboard statistics using database-level aggregation.

### Security & Infrastructure
- **FR7:** System must track request counts per IP address using a distributed store (Redis/KV).
- **FR8:** System must block requests exceeding the defined rate limit (100 req/min).
- **FR9:** Rate limits must persist across serverless function cold starts.

### Platform & SEO
- **FR10:** Public pages (Home, Services) must render unique `<title>` and `<meta name="description">` tags.
- **FR11:** System must provide a valid `robots.txt` and `sitemap.xml`.
- **FR12:** App must handle offline state gracefully via PWA Service Worker fallback.

## 6. Non-Functional Requirements (NFRs)

### Performance
- **API Latency:** < 200ms (p95) for all Admin Stats endpoints.
- **Slot Generation:** Execution time < 100ms per request.
- **Core Web Vitals:** Largest Contentful Paint (LCP) < 1.5s on 4G networks.

### Reliability & Availability
- **Uptime:** 99.9% availability target.
- **Resilience:** App must not crash or show white screen when disconnected.

### Compatibility
- **Browser Support:** Modern Chrome, Safari, Edge, Firefox (Latest 2 versions).
- **Mobile First:** Interface must be strictly optimized for mobile touch targets and viewports.
