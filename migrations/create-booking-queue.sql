-- Migration: Crea tabella booking_queue per gestire le code delle prenotazioni
-- Data: 2025-08-30

CREATE TABLE IF NOT EXISTS booking_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    barber_email TEXT NOT NULL,
    requested_date TEXT NOT NULL,
    requested_time_slot TEXT,
    service_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    queue_position INTEGER NOT NULL,
    status TEXT DEFAULT 'waiting' NOT NULL,
    priority INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    notified_at TIMESTAMP,
    expires_at TIMESTAMP,
    notes TEXT,
    original_slot_requested TEXT,
    notification_method TEXT,
    notification_sent BOOLEAN DEFAULT FALSE
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_booking_queue_barber_date ON booking_queue(barber_email, requested_date);
CREATE INDEX IF NOT EXISTS idx_booking_queue_status ON booking_queue(status);
CREATE INDEX IF NOT EXISTS idx_booking_queue_position ON booking_queue(queue_position);
CREATE INDEX IF NOT EXISTS idx_booking_queue_priority ON booking_queue(priority DESC, created_at ASC);

-- Commenti per documentazione
COMMENT ON TABLE booking_queue IS 'Coda delle prenotazioni per giornate complete';
COMMENT ON COLUMN booking_queue.queue_position IS 'Posizione nella coda (1 = primo, 2 = secondo, etc.)';
COMMENT ON COLUMN booking_queue.status IS 'waiting=in attesa, notified=notificato, expired=scaduto, converted=convertito in prenotazione';
COMMENT ON COLUMN booking_queue.priority IS '1=normale, 2=alta priorità';
COMMENT ON COLUMN booking_queue.expires_at IS 'Scadenza per accettare quando notificato (tipicamente 30 minuti)';
