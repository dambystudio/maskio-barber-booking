import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function removeWrongClosures() {
  try {
    console.log('🧹 RIMOZIONE CHIUSURE ERRATE (18-22 NOV)\n');

    const dates = ['2025-11-18', '2025-11-19', '2025-11-20', '2025-11-21', '2025-11-22'];
    const nicoloEmail = 'giorgiodesa00@gmail.com';

    // Query parametrizzata corretta
    const deleted = await sql`
      DELETE FROM barber_closures
      WHERE closure_date = ANY(${dates})
      AND closure_type = 'full'
      AND barber_email != ${nicoloEmail}
      RETURNING barber_email, closure_date
    `;

    console.log(`✅ Rimosse ${deleted.length} chiusure errate:\n`);
    deleted.forEach(d => {
      console.log(`   - ${d.barber_email}: ${d.closure_date}`);
    });

    // Ripristina schedules per Fabio e Michele
    const fabioEmail = 'fabio.cassano97@icloud.com';
    const micheleEmail = 'michelebiancofiore0230@gmail.com';

    const fabio = await sql`SELECT id FROM barbers WHERE email = ${fabioEmail}`;
    const michele = await sql`SELECT id FROM barbers WHERE email = ${micheleEmail}`;

    if (fabio.length > 0) {
      for (const date of dates) {
        await sql`
          UPDATE barber_schedules
          SET day_off = false
          WHERE barber_id = ${fabio[0].id}
          AND date = ${date}
        `;
      }
      console.log(`\n✅ Schedule ripristinati per Fabio`);
    }

    if (michele.length > 0) {
      for (const date of dates) {
        await sql`
          UPDATE barber_schedules
          SET day_off = false
          WHERE barber_id = ${michele[0].id}
          AND date = ${date}
        `;
      }
      console.log(`✅ Schedule ripristinati per Michele`);
    }

    console.log('\n✨ Pulizia completata!\n');

  } catch (error) {
    console.error('❌ Errore:', error);
    throw error;
  }
}

removeWrongClosures();
