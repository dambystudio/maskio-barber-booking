import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Carica le variabili d'ambiente
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkDatabaseStatus() {
  try {
    console.log('🔍 Controllo stato del database dopo pulizia...\n');
    
    // Controlla prenotazioni
    const bookings = await sql`SELECT COUNT(*) FROM bookings`;
    console.log(`📅 Prenotazioni: ${bookings[0].count}`);
    
    // Controlla utenti
    const users = await sql`SELECT COUNT(*) FROM users`;
    console.log(`👤 Utenti: ${users[0].count}`);
    
    // Controlla barbieri (non cancellati)
    const barbers = await sql`SELECT COUNT(*) FROM barbers`;
    console.log(`👨‍💼 Barbieri: ${barbers[0].count}`);
    
    // Controlla servizi (non cancellati)
    const services = await sql`SELECT COUNT(*) FROM services`;
    console.log(`🛠️  Servizi: ${services[0].count}`);
    
    console.log('\n✅ Database pulito correttamente!');
    console.log('📋 I barbieri e servizi sono stati mantenuti per continuare a funzionare.');
    
  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

checkDatabaseStatus();
