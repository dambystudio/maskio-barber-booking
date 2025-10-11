import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function checkWaitlistDates() {
  try {
    console.log('🔍 Controllo liste d\'attesa per le date specifiche...\n');

    const dates = ['2025-10-11', '2025-10-14', '2025-10-18', '2025-10-24'];

    for (const date of dates) {
      console.log(`\n📅 DATA: ${date}`);
      console.log('─'.repeat(60));

      const entries = await sql`
        SELECT 
          w.*,
          u.name as user_name,
          u.email as user_email,
          u.phone as user_phone,
          b.name as barber_name
        FROM waitlist w
        LEFT JOIN users u ON w.user_id = u.id
        LEFT JOIN barbers b ON w.barber_id = b.id
        WHERE w.date = ${date}
        ORDER BY w.created_at ASC
      `;

      if (entries.length === 0) {
        console.log('❌ Nessuna lista d\'attesa trovata per questa data');
      } else {
        console.log(`✅ Trovate ${entries.length} entry in lista d'attesa:\n`);
        
        entries.forEach((entry, index) => {
          console.log(`${index + 1}. ${entry.user_name || entry.customer_name || 'N/A'}`);
          console.log(`   Email: ${entry.user_email || entry.customer_email || 'N/A'}`);
          console.log(`   Phone: ${entry.user_phone || entry.customer_phone || 'N/A'}`);
          console.log(`   Barbiere: ${entry.barber_name || entry.barber_id}`);
          console.log(`   Orario preferito: ${entry.preferred_time || 'Non specificato'}`);
          console.log(`   Status: ${entry.status}`);
          console.log(`   Creato: ${entry.created_at}`);
          console.log();
        });
      }
    }

    // Mostra tutte le date con liste d'attesa attive
    console.log('\n\n📊 RIEPILOGO: Tutte le date con liste d\'attesa attive');
    console.log('═'.repeat(60));

    const allWaitlist = await sql`
      SELECT 
        w.date,
        COUNT(*) as total,
        string_agg(DISTINCT b.name, ', ') as barbers
      FROM waitlist w
      LEFT JOIN barbers b ON w.barber_id = b.id
      WHERE w.status IN ('active', 'waiting', 'notified')
      GROUP BY w.date
      ORDER BY w.date ASC
    `;

    if (allWaitlist.length === 0) {
      console.log('❌ Nessuna lista d\'attesa attiva nel sistema');
    } else {
      allWaitlist.forEach(row => {
        console.log(`📅 ${row.date}: ${row.total} entry (Barbieri: ${row.barbers || 'N/A'})`);
      });
    }

    // Verifica struttura tabella waitlist
    console.log('\n\n🔍 Struttura tabella waitlist:');
    console.log('═'.repeat(60));
    
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'waitlist'
      ORDER BY ordinal_position
    `;

    tableInfo.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

checkWaitlistDates();
