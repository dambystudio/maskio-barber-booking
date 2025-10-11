import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function updateWaitlistTable() {
  console.log('🔄 Aggiornamento tabella waitlist...\n');

  try {
    // Aggiungi nuove colonne per gestire le offerte
    console.log('➕ Aggiunta colonne per offerte...');
    
    await sql`
      ALTER TABLE waitlist 
      ADD COLUMN IF NOT EXISTS offered_time VARCHAR(10),
      ADD COLUMN IF NOT EXISTS offered_booking_id UUID,
      ADD COLUMN IF NOT EXISTS offer_expires_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS offer_response VARCHAR(20)
    `;

    console.log('✅ Colonne aggiunte con successo!');

    // Verifica la struttura
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'waitlist' 
      ORDER BY ordinal_position
    `;

    console.log('\n📊 Struttura aggiornata della tabella waitlist:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    console.log('\n🎉 Aggiornamento completato!');
    console.log('\n📝 Nuove colonne:');
    console.log('  - offered_time: Orario offerto all\'utente');
    console.log('  - offered_booking_id: ID della prenotazione cancellata');
    console.log('  - offer_expires_at: Scadenza offerta (24 ore)');
    console.log('  - offer_response: Risposta utente (accepted/declined)');

  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento:', error);
  }
}

updateWaitlistTable();
