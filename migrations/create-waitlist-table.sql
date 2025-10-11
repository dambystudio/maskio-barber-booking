-- Waitlist Table
-- Gestisce la coda d'attesa per gli slot occupati

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  barber_id VARCHAR(50) NOT NULL REFERENCES barbers(id),
  date VARCHAR(10) NOT NULL, -- YYYY-MM-DD
  preferred_time VARCHAR(5), -- HH:MM (opzionale, se l'utente vuole un orario specifico)
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active' | 'notified' | 'expired' | 'booked'
  priority INTEGER DEFAULT 0, -- Per gestire la priorità (0 = normale, 1+ = alta priorità)
  notified_at TIMESTAMP, -- Quando è stata inviata la notifica
  notification_sent BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP -- Se null, non scade mai
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_waitlist_barber_date ON waitlist(barber_id, date);
CREATE INDEX IF NOT EXISTS idx_waitlist_user ON waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_created ON waitlist(created_at);

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER waitlist_updated_at
  BEFORE UPDATE ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION update_waitlist_updated_at();

-- Commenti
COMMENT ON TABLE waitlist IS 'Lista d''attesa per slot occupati';
COMMENT ON COLUMN waitlist.status IS 'active: in attesa, notified: notificato di slot libero, expired: scaduto, booked: ha prenotato';
COMMENT ON COLUMN waitlist.priority IS 'Priorità nella coda (0=normale, 1+=alta)';
COMMENT ON COLUMN waitlist.expires_at IS 'Timestamp di scadenza della richiesta (null=non scade)';
