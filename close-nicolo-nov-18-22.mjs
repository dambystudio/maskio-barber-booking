import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function closeNicoloNov18to22() {
  try {
    console.log('🚫 CHIUSURA NICOLÒ: 18-22 NOVEMBRE 2025\n');

    const dates = ['2025-11-18', '2025-11-19', '2025-11-20', '2025-11-21', '2025-11-22'];
    const nicoloEmail = 'giorgiodesa00@gmail.com';
    
    // Ottieni dati Nicolò
    const barber = await sql`
      SELECT id, name FROM barbers 
      WHERE email = ${nicoloEmail}
    `;

    if (barber.length === 0) {
      console.log('❌ Nicolò non trovato');
      return;
    }

    const nicoloId = barber[0].id;
    const nicoloName = barber[0].name;

    console.log(`📋 Barbiere: ${nicoloName} (${nicoloEmail})\n`);

    // Prima rimuovi eventuali chiusure create per errore per altri barbieri in queste date
    console.log('🧹 Pulizia chiusure errate...');
    const deletedOthers = await sql`
      DELETE FROM barber_closures
      WHERE closure_date IN (${dates.join(',')})
      AND closure_type = 'full'
      AND barber_email != ${nicoloEmail}
      RETURNING barber_email, closure_date
    `;
    
    if (deletedOthers.length > 0) {
      console.log(`✅ Rimosse ${deletedOthers.length} chiusure errate per altri barbieri\n`);
    } else {
      console.log('✅ Nessuna chiusura errata da rimuovere\n');
    }

    let closuresCreated = 0;
    let schedulesUpdated = 0;

    for (const date of dates) {
      console.log(`📅 Elaborazione ${date}...`);

      // Verifica se esiste già una chiusura per questa data
      const existingClosure = await sql`
        SELECT id FROM barber_closures
        WHERE barber_email = ${nicoloEmail}
        AND closure_date = ${date}
        AND closure_type = 'full'
      `;

      if (existingClosure.length === 0) {
        await sql`
          INSERT INTO barber_closures (
            barber_email,
            closure_date,
            closure_type,
            reason,
            created_by,
            created_at,
            updated_at
          ) VALUES (
            ${nicoloEmail},
            ${date},
            'full',
            'Chiusura Nicolò',
            'admin',
            NOW(),
            NOW()
          )
        `;
        closuresCreated++;
        console.log(`   ✅ Chiusura creata`);
      } else {
        console.log(`   ⏭️  Chiusura già esistente`);
      }

      // Aggiorna schedule impostando day_off = true
      const updated = await sql`
        UPDATE barber_schedules
        SET day_off = true
        WHERE barber_id = ${nicoloId}
        AND date = ${date}
      `;

      if (Array.isArray(updated) && updated.length > 0) {
        schedulesUpdated++;
        console.log(`   ✅ Schedule aggiornato`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RIEPILOGO');
    console.log('='.repeat(60));
    console.log(`👤 Barbiere: ${nicoloName}`);
    console.log(`📧 Email: ${nicoloEmail}`);
    console.log(`📅 Date chiuse: ${dates.join(', ')}`);
    console.log(`🚫 Chiusure create: ${closuresCreated}`);
    console.log(`📅 Schedule aggiornati: ${schedulesUpdated}`);
    console.log('='.repeat(60));
    console.log('\n✨ Chiusura completata con successo!\n');

  } catch (error) {
    console.error('❌ Errore:', error);
    throw error;
  }
}

closeNicoloNov18to22();
