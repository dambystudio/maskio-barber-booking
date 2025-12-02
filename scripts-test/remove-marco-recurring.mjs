import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function removeMarcoRecurringClosures() {
  try {
    console.log('🗑️ RIMOZIONE CHIUSURE RICORRENTI DI MARCO\n');

    const marcoEmail = 'marcocis2006@gmail.com';

    const deleted = await sql`
      DELETE FROM barber_recurring_closures
      WHERE barber_email = ${marcoEmail}
      RETURNING id
    `;

    console.log(`✅ Eliminate ${deleted.length} chiusure ricorrenti per ${marcoEmail}\n`);

    // Verifica rimozione
    const remaining = await sql`
      SELECT * FROM barber_recurring_closures
    `;

    console.log('📋 CHIUSURE RICORRENTI RIMANENTI:\n');
    remaining.forEach(c => {
      const closedDays = JSON.parse(c.closed_days);
      const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
      const closedDayNames = closedDays.map(d => dayNames[d]).join(', ');
      console.log(`👤 ${c.barber_email}: ${closedDayNames}`);
    });

    console.log('\n✨ Operazione completata!\n');

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

removeMarcoRecurringClosures();
