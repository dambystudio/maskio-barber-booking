-- Migrazione per aggiungere tracking delle chiusure auto rimosse
-- Questo permette ai barbieri di rimuovere chiusure automatiche senza che vengano ricreate

-- Tabella per tracciare le chiusure automatiche rimosse intenzionalmente dai barbieri
CREATE TABLE IF NOT EXISTS barber_removed_auto_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_email VARCHAR(255) NOT NULL,
  closure_date VARCHAR(10) NOT NULL, -- YYYY-MM-DD
  closure_type VARCHAR(20) NOT NULL, -- 'full', 'morning', 'afternoon'
  removed_by VARCHAR(255), -- Email di chi ha rimosso (barbiere o admin)
  removed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reason TEXT, -- Motivo opzionale della rimozione
  
  -- Indice per ricerche veloci
  UNIQUE(barber_email, closure_date, closure_type)
);

-- Indice per query frequenti
CREATE INDEX IF NOT EXISTS idx_removed_auto_closures_date 
  ON barber_removed_auto_closures(barber_email, closure_date);

COMMENT ON TABLE barber_removed_auto_closures IS 
  'Traccia le chiusure automatiche rimosse intenzionalmente dai barbieri. Il daily-update NON ricrea chiusure presenti in questa tabella.';
