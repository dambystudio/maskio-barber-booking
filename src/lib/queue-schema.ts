// Schema per la coda delle prenotazioni
import { pgTable, text, timestamp, integer, boolean, uuid } from 'drizzle-orm/pg-core';

export const bookingQueue = pgTable('booking_queue', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerEmail: text('customer_email'),
  barberEmail: text('barber_email').notNull(),
  requestedDate: text('requested_date').notNull(), // YYYY-MM-DD format
  requestedTimeSlot: text('requested_time_slot'), // Orario preferito se specificato
  serviceId: text('service_id').notNull(),
  serviceName: text('service_name').notNull(),
  queuePosition: integer('queue_position').notNull(),
  status: text('status').default('waiting').notNull(), // 'waiting', 'notified', 'expired', 'converted'
  priority: integer('priority').default(1).notNull(), // 1 = normale, 2 = alta priorità
  createdAt: timestamp('created_at').defaultNow().notNull(),
  notifiedAt: timestamp('notified_at'),
  expiresAt: timestamp('expires_at'), // Tempo limite per accettare quando notificato
  notes: text('notes'),
  
  // Metadata per tracking
  originalSlotRequested: text('original_slot_requested'),
  notificationMethod: text('notification_method'), // 'whatsapp', 'sms', 'email'
  notificationSent: boolean('notification_sent').default(false),
});

export type BookingQueue = typeof bookingQueue.$inferSelect;
export type NewBookingQueue = typeof bookingQueue.$inferInsert;
