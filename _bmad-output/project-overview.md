# Project Overview

## Maskio Barber Booking

**Type**: Next.js Web Application (Monolith)
**Purpose**: Booking system for a Barber Shop, managing appointments, barbers, services, and closures.

## Executive Summary

This is a modern web application built with **Next.js 15 (App Router)** and **React**. It features a comprehensive booking system where customers can schedule appointments with specific barbers. It uses **PostgreSQL** with **Drizzle ORM** for data persistence and **NextAuth** for authentication.

Key features include:
- User & Barber Authentication.
- Real-time slot availability.
- Admin panel for managing bookings and shop settings.
- Email and Push notifications.
- PWA (Progressive Web App) capabilities.
- Dynamic closure management (holidays, recurring days off).

## Technology Stack

| Category | Technology | Description |
|----------|------------|-------------|
| **Framework** | Next.js 15 | App Router, Server Components |
| **Language** | TypeScript | Strong typing |
| **Database** | PostgreSQL | Relational Data |
| **ORM** | Drizzle | Type-safe SQL |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Auth** | NextAuth.js | Session management |
| **Deployment** | Vercel | Hosting & Edge |

## Documentation Index

- [Source Tree Analysis](./source-tree-analysis.md)
- [Data Models](./data-models.md)
- [API Contracts](./api-contracts.md)
- [Component Inventory](./component-inventory.md)
- [Development Guide](./development-guide.md)
- [Deployment Guide](./deployment-guide.md)

## Legacy Documentation

There are **86** legacy documentation files located in `md-file/` and the root directory, covering specific features like "Christmas Theme", "Aruba DNS", "Waitlist System", etc. Refer to `md-file/` for historical context.
