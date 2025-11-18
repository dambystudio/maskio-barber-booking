import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function cleanupMarcoData() {
  try {
    console.log('🗑️ PULIZIA DATI BARBIERE: MARCO\n');
    console.log('Email: marcocis2006@gmail.com\n');

    const marcoEmail = 'marcocis2006@gmail.com';

    // 1. Trova l'ID del barbiere Marco
    console.log('🔍 Ricerca barbiere...');
    const barber = await sql`
      SELECT id, name, user_id FROM barbers 
      WHERE email = ${marcoEmail}
    `;

    if (barber.length === 0) {
      console.log('⚠️ Barbiere non trovato nella tabella barbers');
    } else {
      const barberId = barber[0].id;
      const barberUserId = barber[0].user_id;
      console.log(`✅ Trovato: ${barber[0].name} (ID: ${barberId}, User ID: ${barberUserId})\n`);

      // 2. Elimina chiusure ricorrenti
      console.log('🗑️ Eliminazione chiusure ricorrenti...');
      const recurringDeleted = await sql`
        DELETE FROM barber_recurring_closures
        WHERE barber_email = ${marcoEmail}
        RETURNING id
      `;
      console.log(`✅ Eliminate ${recurringDeleted.length} chiusure ricorrenti\n`);

      // 3. Elimina chiusure specifiche
      console.log('🗑️ Eliminazione chiusure specifiche...');
      const closuresDeleted = await sql`
        DELETE FROM barber_closures
        WHERE barber_email = ${marcoEmail}
        RETURNING id
      `;
      console.log(`✅ Eliminate ${closuresDeleted.length} chiusure specifiche\n`);

      // 4. Elimina schedule
      console.log('🗑️ Eliminazione schedule...');
      const schedulesDeleted = await sql`
        DELETE FROM barber_schedules
        WHERE barber_id = ${barberId}
        RETURNING id
      `;
      console.log(`✅ Eliminati ${schedulesDeleted.length} schedule\n`);

      // 5. Conta appuntamenti (NON li eliminiamo per mantenere lo storico)
      console.log('📊 Controllo appuntamenti...');
      const bookings = await sql`
        SELECT COUNT(*) as count FROM bookings
        WHERE barber_id = ${barberId}
      `;
      console.log(`ℹ️ Trovati ${bookings[0].count} appuntamenti`);
      console.log(`   (MANTENUTI per storico prenotazioni)\n`);

      // 6. Elimina dalla tabella barbers
      console.log('🗑️ Eliminazione dalla tabella barbers...');
      await sql`
        DELETE FROM barbers
        WHERE id = ${barberId}
      `;
      console.log(`✅ Barbiere rimosso dalla tabella barbers\n`);

      // 7. Aggiorna ruolo utente (da barber a customer se esiste)
      if (barberUserId) {
        console.log('👤 Aggiornamento ruolo utente...');
        const userUpdated = await sql`
          UPDATE users
          SET role = 'customer', updated_at = NOW()
          WHERE id = ${barberUserId}
          RETURNING email, name, role
        `;
        if (userUpdated.length > 0) {
          console.log(`✅ Ruolo utente aggiornato a "customer": ${userUpdated[0].name}\n`);
        }
      }
    }

    // 8. Verifica lista d'attesa
    console.log('📋 Controllo lista d\'attesa...');
    const waitlist = await sql`
      SELECT COUNT(*) as count FROM waitlist
      WHERE barber_id IN (
        SELECT id FROM barbers WHERE email = ${marcoEmail}
      )
    `;
    console.log(`ℹ️ Trovati ${waitlist[0].count} entry in lista d'attesa`);
    if (waitlist[0].count > 0) {
      console.log(`   (Potrebbero essere già eliminate con il barbiere)\n`);
    }

    // 9. Riepilogo finale
    console.log('='.repeat(60));
    console.log('📊 RIEPILOGO PULIZIA');
    console.log('='.repeat(60));
    console.log(`👤 Barbiere: Marco`);
    console.log(`📧 Email: ${marcoEmail}`);
    if (barber.length > 0) {
      console.log(`\n✅ ELIMINATO:`);
      console.log(`   - ${recurringDeleted.length} chiusure ricorrenti`);
      console.log(`   - ${closuresDeleted.length} chiusure specifiche`);
      console.log(`   - ${schedulesDeleted.length} schedule`);
      console.log(`   - Record dalla tabella barbers`);
      console.log(`   - Ruolo utente aggiornato a "customer"`);
      console.log(`\n📦 MANTENUTO (per storico):`);
      console.log(`   - ${bookings[0].count} appuntamenti`);
    }
    console.log('='.repeat(60));
    console.log('\n✨ Pulizia completata con successo!\n');

  } catch (error) {
    console.error('❌ Errore durante la pulizia:', error);
    throw error;
  }
}

cleanupMarcoData();
