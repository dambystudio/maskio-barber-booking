-- Semplificazione schema waitlist
-- Rimuove campi non necessari: time, service, price, offeredTime, offeredBookingId, offerExpiresAt, offerResponse

-- Backup della tabella (opzionale - commentato per sicurezza)
-- CREATE TABLE waitlist_backup AS SELECT * FROM waitlist;

-- Rimuovi colonne non necessarie
ALTER TABLE waitlist DROP COLUMN IF EXISTS time;
ALTER TABLE waitlist DROP COLUMN IF EXISTS service;
ALTER TABLE waitlist DROP COLUMN IF EXISTS price;
ALTER TABLE waitlist DROP COLUMN IF EXISTS offered_time;
ALTER TABLE waitlist DROP COLUMN IF EXISTS offered_booking_id;
ALTER TABLE waitlist DROP COLUMN IF EXISTS offer_expires_at;
ALTER TABLE waitlist DROP COLUMN IF EXISTS offer_response;

-- Verifica schema finale
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'waitlist'
ORDER BY ordinal_position;
