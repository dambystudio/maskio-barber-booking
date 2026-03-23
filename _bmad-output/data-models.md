# Data Models Documentation

## Overview

The database uses **PostgreSQL** with **Drizzle ORM**. The schema is defined in `src/lib/schema.ts` and includes tables for users, bookings, barbers, services, and system configuration.

## Schema Definitions

### Core Entities

#### Users (`users`)
Stores all user accounts (customers, barbers, admins).
- `id`: UUID (PK)
- `email`: Varchar(255) (Unique)
- `name`: Varchar(255)
- `role`: Varchar(20) ('customer', 'admin', 'barber')
- `phone`: Varchar(20)
- `password`: Text (Optional, for non-OAuth)
- `image`: Text
- `securityQuestion`: Varchar(500)
- `securityAnswerHash`: Text
- `emailVerified`: Timestamp
- `createdAt`: Timestamp
- `lastLogin`: Timestamp

#### Bookings (`bookings`)
Core booking records.
- `id`: UUID (PK)
- `userId`: UUID (FK -> users.id, nullable for guest bookings)
- `customerName`: Varchar(255)
- `customerEmail`: Varchar(255)
- `customerPhone`: Varchar(20)
- `barberId`: Varchar(50) (FK -> barbers.id)
- `barberName`: Varchar(255)
- `service`: Varchar(255)
- `price`: Decimal(10,2)
- `date`: Varchar(10) (YYYY-MM-DD)
- `time`: Varchar(5) (HH:MM)
- `duration`: Integer (minutes)
- `status`: Varchar(20) ('pending', 'confirmed', 'completed', 'cancelled')
- `notes`: Text
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

#### Barbers (`barbers`)
Barber profiles.
- `id`: Varchar(50) (PK, custom ID)
- `userId`: UUID (FK -> users.id)
- `name`: Varchar(255)
- `email`: Varchar(255)
- `phone`: Varchar(20)
- `specialties`: Text (JSON)
- `experience`: Text
- `isActive`: Boolean
- `createdAt`: Timestamp

#### Services (`services`)
Service menu.
- `id`: Varchar(50) (PK)
- `name`: Varchar(255)
- `description`: Text
- `price`: Decimal(10,2)
- `duration`: Integer (minutes)
- `isActive`: Boolean
- `createdAt`: Timestamp

### Scheduling & Management

#### Barber Schedules (`barber_schedules`)
Daily availability for barbers.
- `id`: UUID (PK)
- `barberId`: Varchar(50) (FK -> barbers.id)
- `date`: Varchar(10)
- `availableSlots`: Text (JSON array)
- `unavailableSlots`: Text (JSON array)
- `dayOff`: Boolean

#### Barber Closures (`barber_closures`)
Specific closure periods (vacation, etc.).
- `id`: UUID (PK)
- `barberEmail`: Varchar(255)
- `closureDate`: Varchar(10)
- `closureType`: Varchar(20) ('full', 'morning', 'afternoon')
- `reason`: Text

#### Barber Recurring Closures (`barber_recurring_closures`)
Weekly recurring days off.
- `id`: UUID (PK)
- `barberEmail`: Varchar(255)
- `closedDays`: Text (JSON array of day indices)

#### Closure Settings (`closure_settings`)
Shop-wide closure rules.
- `id`: Varchar(50) (Default: 'shop_closures')
- `closedDays`: Text (JSON array)
- `closedDates`: Text (JSON array)
- `updatedBy`: UUID (FK -> users.id)

#### Waitlist (`waitlist`)
Queue for occupied slots.
- `id`: UUID (PK)
- `userId`: UUID (FK -> users.id)
- `barberId`: Varchar(50)
- `date`: Varchar(10)
- `position`: Integer (FIFO)
- `status`: Varchar(20)

### User & System

#### User Preferences (`user_preferences`)
Customer preferences.
- `id`: UUID (PK)
- `userId`: UUID (FK -> users.id)
- `preferredBarberId`: Varchar(50)
- `notifications`: Boolean

#### Authorized Roles (`authorized_roles`)
Dynamic role authorization.
- `id`: UUID (PK)
- `email`: Varchar(255)
- `role`: Varchar(20)

#### Push Subscriptions (`push_subscriptions`)
Web Push notification endorsements.
- `id`: UUID (PK)
- `userId`: UUID (FK -> users.id)
- `endpoint`: Text
- `auth`: Text
- `p256dh`: Text

### Auth (NextAuth)
Standard NextAuth tables:
- `accounts`
- `sessions`
- `verificationToken`
