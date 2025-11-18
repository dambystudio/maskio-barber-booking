#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

async function updateNicoloEmail() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    const oldEmail = 'giorgiodesa00@gmail.com';
    const newEmail = 'nicolodesantis069@gmail.com';

    // 1. Aggiorna tabella barbers
    console.log('📝 Aggiornamento tabella barbers...');
    const barbersResult = await client.query(
      'UPDATE barbers SET email = $1 WHERE email = $2 RETURNING *',
      [newEmail, oldEmail]
    );
    console.log(`✅ Barbers aggiornati: ${barbersResult.rowCount}`);
    if (barbersResult.rows.length > 0) {
      console.log('   Dati:', barbersResult.rows[0]);
    }

    // 2. Aggiorna tabella barber_schedules (usa barber_id che è l'id del barber, non l'email)
    console.log('\n📝 Verifica tabella barber_schedules...');
    const scheduleCount = await client.query(
      'SELECT COUNT(*) FROM barber_schedules WHERE barber_id = $1',
      ['nicolo']
    );
    console.log(`✅ Schedules per Nicolò (ID rimane 'nicolo'): ${scheduleCount.rows[0].count}`);

    // 3. Aggiorna tabella barber_closures (usa barber_email)
    console.log('\n📝 Aggiornamento tabella barber_closures...');
    const closuresResult = await client.query(
      'UPDATE barber_closures SET barber_email = $1 WHERE barber_email = $2',
      [newEmail, oldEmail]
    );
    const closureCount = await client.query(
      'SELECT COUNT(*) FROM barber_closures WHERE barber_email = $1',
      [newEmail]
    );
    console.log(`✅ Closures aggiornate: ${closureCount.rows[0].count}`);

    // 4. Aggiorna tabella barber_recurring_closures (usa barber_email)
    console.log('\n📝 Aggiornamento tabella barber_recurring_closures...');
    const recurringResult = await client.query(
      'UPDATE barber_recurring_closures SET barber_email = $1 WHERE barber_email = $2 RETURNING *',
      [newEmail, oldEmail]
    );
    console.log(`✅ Recurring closures aggiornate: ${recurringResult.rowCount}`);
    if (recurringResult.rows.length > 0) {
      console.log('   Giorni chiusi:', recurringResult.rows[0].closed_days);
    }

    // 5. Aggiorna tabella bookings (usa barber_id, non email)
    console.log('\n📝 Verifica tabella bookings...');
    const bookingCount = await client.query(
      'SELECT COUNT(*) FROM bookings WHERE barber_id = $1',
      ['nicolo']
    );
    console.log(`✅ Bookings per Nicolò (ID rimane 'nicolo'): ${bookingCount.rows[0].count}`);

    // 6. Aggiorna tabella waitlist (normalizza il nome del barbiere)
    console.log('\n📝 Aggiornamento tabella waitlist...');
    const waitlistResult = await client.query(
      `UPDATE waitlist 
       SET barber_name = 'Nicolò' 
       WHERE barber_name ILIKE '%nicol%' OR barber_name ILIKE '%de santis%'`,
    );
    const waitlistCount = await client.query(
      `SELECT COUNT(*) FROM waitlist WHERE barber_name = 'Nicolò'`
    );
    console.log(`✅ Waitlist aggiornate: ${waitlistCount.rows[0].count}`);

    // 7. Verifica finale
    console.log('\n\n🔍 VERIFICA FINALE:\n');
    
    const verifyBarber = await client.query(
      'SELECT * FROM barbers WHERE email = $1',
      [newEmail]
    );
    console.log('✅ Barber trovato:', verifyBarber.rows[0]?.name || 'NESSUNO');

    const verifySchedules = await client.query(
      'SELECT COUNT(*) as count FROM barber_schedules WHERE barber_id = $1',
      ['nicolo']
    );
    console.log(`✅ Schedules totali: ${verifySchedules.rows[0].count}`);

    const verifyClosures = await client.query(
      'SELECT COUNT(*) as count FROM barber_closures WHERE barber_email = $1',
      [newEmail]
    );
    console.log(`✅ Closures totali: ${verifyClosures.rows[0].count}`);

    const verifyRecurring = await client.query(
      'SELECT closed_days FROM barber_recurring_closures WHERE barber_email = $1',
      [newEmail]
    );
    console.log(`✅ Recurring closures: ${verifyRecurring.rows[0]?.closed_days || 'NESSUNA'}`);

    const verifyBookings = await client.query(
      'SELECT COUNT(*) as count FROM bookings WHERE barber_id = $1',
      ['nicolo']
    );
    console.log(`✅ Bookings totali: ${verifyBookings.rows[0].count}`);

    const verifyOldEmail = await client.query(
      `SELECT 
        (SELECT COUNT(*) FROM barbers WHERE email = $1) as barbers,
        (SELECT COUNT(*) FROM barber_closures WHERE barber_email = $1) as closures,
        (SELECT COUNT(*) FROM barber_recurring_closures WHERE barber_email = $1) as recurring`,
      [oldEmail]
    );
    console.log('\n🔍 Verifica vecchia email (dovrebbero essere tutti 0):');
    console.log('   Barbers:', verifyOldEmail.rows[0].barbers);
    console.log('   Closures:', verifyOldEmail.rows[0].closures);
    console.log('   Recurring:', verifyOldEmail.rows[0].recurring);

    console.log('\n✅ AGGIORNAMENTO COMPLETATO CON SUCCESSO!\n');

  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento:', error);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Disconnesso dal database');
  }
}

// Esegui lo script
updateNicoloEmail();
