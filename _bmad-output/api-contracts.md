# API Contracts

## Overview

The application exposes a RESTful API via Next.js App Router Route Handlers.
Base URL: `/api`

Authentication is handled via `next-auth` (Session based).
Most endpoints require authentication, and some require specific roles (`admin`, `barber`).

## Key Endpoints

### Bookings (`/api/bookings`)

**Methods:**
- `GET`: Retrieve bookings.
  - **Auth**: Required.
  - **Params**: `date`, `barberId`, `status`, `userId`, `fetchAll` (admin/barber only).
  - **Permissions**:
    - `admin`: Can filter by any param.
    - `barber`: Sees own bookings (or others if `barberEmail` provided).
    - `customer`: Sees only own bookings.
- `POST`: Create a new booking.
  - **Auth**: Required.
  - **Body**: `barberId`, `serviceIds`, `date`, `time`, `customerInfo` (name, phone, email - optional for logged-in users).
  - **Validation**:
    - Checks past dates, Sundays (shop closed).
    - Checks slot availability (concurrency check).
    - Checks user double booking (customers only).
- `PUT`: Update a booking.
  - **Auth**: Required.
  - **Body**: `bookingId` + fields to update.
  - **Logic**: Sends email/push if status changes to `cancelled`.
- `PATCH`: Update booking status.
  - **Auth**: Required.
  - **Body**: `id`, `status`.
- `DELETE`: Delete a booking.
  - **Auth**: Required.
  - **Params**: `id`.

### Barbers (`/api/barbers`)

**Methods:**
- `GET`: Retrieve list of all barbers.
  - **Auth**: Public (likely, code shows no session check in snippet).
  - **Response**: Array of Barber objects.

### Auth (`/api/auth/[...nextauth]`)

**Methods:**
- `GET/POST`: Handles NextAuth.js authentication flow (signin, signout, callback).

## Endpoint Examples

### Get Bookings (Admin)
`GET /api/bookings?date=2024-06-20`

### Create Booking
`POST /api/bookings`
```json
{
  "barberId": "fabio",
  "serviceIds": ["taglio-capelli"],
  "date": "2024-06-25",
  "time": "10:00",
  "customerName": "Mario Rossi"
}
```

## Complete Endpoint List

### Administration
- `/api/admin/database-cleanup`
- `/api/admin/database-status`
- `/api/admin/delete-bookings`
- `/api/admin/manage-roles`
- `/api/admin/promote-user`
- `/api/admin/role-config`
- `/api/admin/stats`
- `/api/admin/users`

### Authentication
- `/api/auth/[...nextauth]`
- `/api/auth/register`
- `/api/auth/register-with-verification`
- `/api/auth/verify`
- `/api/auth/verify-email`

### Barbers & Schedule
- `/api/barbers`
- `/api/barber-closures`
- `/api/barber-recurring-closures`
- `/api/barber-schedules`

### Bookings
- `/api/bookings`
- `/api/bookings/batch-availability`
- `/api/bookings/search`
- `/api/bookings/slots`
- `/api/bookings/test`
- `/api/booking/calendar/[bookingId]` (Dynamic)
- `/api/booking-swap`

### User
- `/api/user/profile`
- `/api/user/update-phone`
- `/api/waitlist`
- `/api/waitlist/approve`

### System & Notifications
- `/api/notifications/send-waitlist-alert`
- `/api/push/notify`
- `/api/push/subscribe`
- `/api/services`
- `/api/google-reviews`
- `/api/google-sitemap`
- `/api/sitemap-xml`
- `/api/manifest`
- `/api/system/daily-update`

### Debug
- `/api/debug/check-permissions`
- `/api/debug/env-check`
