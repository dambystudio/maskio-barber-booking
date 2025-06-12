// Database Schema - PostgreSQL with Drizzle ORM
import { pgTable, varchar, text, timestamp, integer, decimal, boolean, uuid, primaryKey } from 'drizzle-orm/pg-core';

// Users Table
export const users = pgTable('users', {  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('customer'), // 'customer' | 'admin' | 'barber'
  phone: varchar('phone', { length: 20 }),
  password: text('password'), // Optional for OAuth users
  image: text('image'), // Per avatar/foto profilo
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login'),
});

// NextAuth Tables
export const accounts = pgTable('accounts', {
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  id_token: text('id_token'),
  session_state: varchar('session_state', { length: 255 }),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] })
}));

export const sessions = pgTable('sessions', {
  sessionToken: varchar('sessionToken', { length: 255 }).primaryKey(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable('verificationToken', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] })
}));

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
  email: varchar('email', { length: 255 }), // Barber email
  phone: varchar('phone', { length: 20 }), // Barber phone
  specialties: text('specialties'), // JSON array of specialties
  experience: text('experience'), // Barber experience description
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Bookings Table
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id), // Nullable for guest bookings
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 20 }).notNull(),
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

// User Preferences Table (per personalizzazione cliente)
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  preferredBarberId: varchar('preferred_barber_id', { length: 50 }).references(() => barbers.id),
  preferredServices: text('preferred_services'), // JSON array
  preferredTimeSlots: text('preferred_time_slots'), // JSON array
  notifications: boolean('notifications').default(true),
  emailNotifications: boolean('email_notifications').default(true),
  smsNotifications: boolean('sms_notifications').default(false),
  notes: text('notes'), // Note speciali, allergie, ecc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type Barber = typeof barbers.$inferSelect;
export type NewBarber = typeof barbers.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type BarberSchedule = typeof barberSchedules.$inferSelect;
export type NewBarberSchedule = typeof barberSchedules.$inferInsert;
