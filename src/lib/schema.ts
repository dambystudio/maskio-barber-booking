// Database Schema - PostgreSQL with Drizzle ORM
import { pgTable, varchar, text, timestamp, integer, decimal, boolean, uuid } from 'drizzle-orm/pg-core';

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('customer'), // 'customer' | 'admin' | 'barber'
  phone: varchar('phone', { length: 20 }),
  password: text('password'), // Optional for OAuth users
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login'),
});

// Services Table
export const services = pgTable('services', {
  id: varchar('id', { length: 50 }).primaryKey(), // Changed to allow custom IDs
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  duration: integer('duration').notNull(), // in minutes
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Barbers Table
export const barbers = pgTable('barbers', {
  id: varchar('id', { length: 50 }).primaryKey(), // Changed to allow custom IDs
  userId: uuid('user_id').references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  specialties: text('specialties'), // JSON array of specialties
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Bookings Table
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id), // Nullable for guest bookings
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),  customerPhone: varchar('customer_phone', { length: 20 }).notNull(),
  barberId: varchar('barber_id', { length: 50 }).references(() => barbers.id),
  barberName: varchar('barber_name', { length: 255 }).notNull(),
  service: varchar('service', { length: 255 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
  time: varchar('time', { length: 5 }).notNull(), // HH:MM
  duration: integer('duration').notNull(), // in minutes
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Barber Schedules Table
export const barberSchedules = pgTable('barber_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  barberId: varchar('barber_id', { length: 50 }).references(() => barbers.id),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
  availableSlots: text('available_slots'), // JSON array of available time slots
  unavailableSlots: text('unavailable_slots'), // JSON array of unavailable time slots
  dayOff: boolean('day_off').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type Barber = typeof barbers.$inferSelect;
export type NewBarber = typeof barbers.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type BarberSchedule = typeof barberSchedules.$inferSelect;
export type NewBarberSchedule = typeof barberSchedules.$inferInsert;
