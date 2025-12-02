import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function closeShopNov18to22() {
  try {
    console.log('🚫 CHIUSURA COMPLETA: 18-22 NOVEMBRE 2025\n');

    const dates = ['2025-11-18', '2025-11-19', '2025-11-20', '2025-11-21', '2025-11-22'];
    
    // Ottieni tutti i barbieri attivi
    const barbers = await sql`
      SELECT id, name, email FROM barbers WHERE is_active = true
    `;

    console.log(`📋 Barbieri attivi: ${barbers.length}\n`);

    let closuresCreated = 0;
    let schedulesUpdated = 0;

    for (const date of dates) {
      console.log(`📅 Elaborazione ${date}...`);

      // Per ogni barbiere, crea chiusura completa
      for (const barber of barbers) {
        // Verifica se esiste già una chiusura per questa data
        const existingClosure = await sql`
          SELECT id FROM barber_closures
          WHERE barber_email = ${barber.email}
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
              ${barber.email},
              ${date},
              'full',
              'Chiusura barbiere',
              'admin',
              NOW(),
              NOW()
            )
          `;
          closuresCreated++;
          console.log(`   ✅ Chiusura creata per ${barber.name}`);
        } else {
          console.log(`   ⏭️  Chiusura già esistente per ${barber.name}`);
        }

        // Aggiorna schedule impostando day_off = true
        const updated = await sql`
          UPDATE barber_schedules
          SET day_off = true
          WHERE barber_id = ${barber.id}
          AND date = ${date}
        `;

        if (Array.isArray(updated) && updated.length > 0) {
          schedulesUpdated++;
          console.log(`   ✅ Schedule aggiornato per ${barber.name}`);
        }
      }

      console.log('');
    }

    console.log('='.repeat(60));
    console.log('📊 RIEPILOGO');
    console.log('='.repeat(60));
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

closeShopNov18to22();
