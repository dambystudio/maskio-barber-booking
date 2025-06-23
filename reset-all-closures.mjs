import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Configura il percorso del file .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env.local');

console.log('📁 Loading environment from:', envPath);
config({ path: envPath });

import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function resetAllClosures() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    console.log('\n🗑️ RESET ALL CLOSURES AND BOOKINGS');
    console.log('=' .repeat(50));

    // 1. Prima mostra la situazione attuale
    console.log('\n📊 Current status:');
    
    const bookingsCount = await client.query('SELECT COUNT(*) as total FROM bookings');
    console.log(`  📅 Bookings: ${bookingsCount.rows[0].total}`);
    
    const recurringCount = await client.query('SELECT COUNT(*) as total FROM barber_recurring_closures');
    console.log(`  🔄 Recurring closures: ${recurringCount.rows[0].total}`);
    
    const specificCount = await client.query('SELECT COUNT(*) as total FROM barber_closures');
    console.log(`  🚫 Specific closures: ${specificCount.rows[0].total}`);
    
    const generalCount = await client.query('SELECT COUNT(*) as total FROM closure_settings');
    console.log(`  🏪 General closures: ${generalCount.rows[0].total}`);

    // 2. Mostra dettagli delle chiusure prima di cancellarle
    if (recurringCount.rows[0].total > 0) {
      console.log('\n🔄 Current recurring closures:');
      const recurring = await client.query('SELECT * FROM barber_recurring_closures');
      recurring.rows.forEach(row => {
        console.log(`  - ${row.barber_email}: days ${row.closed_days} (created: ${row.created_at})`);
      });
    }

    if (specificCount.rows[0].total > 0) {
      console.log('\n🚫 Current specific closures:');
      const specific = await client.query('SELECT * FROM barber_closures ORDER BY closure_date');
      specific.rows.forEach(row => {
        console.log(`  - ${row.barber_email}: ${row.closure_date} (${row.closure_type}) - ${row.reason || 'No reason'}`);
      });
    }

    if (generalCount.rows[0].total > 0) {
      console.log('\n🏪 Current general closures:');
      const general = await client.query('SELECT * FROM closure_settings');
      general.rows.forEach(row => {
        console.log(`  - Closed days: ${row.closed_days}`);
        console.log(`  - Closed dates: ${row.closed_dates}`);
      });
    }

    // 3. Procedi con la cancellazione
    console.log('\n🗑️ Starting cleanup...');

    // Cancella tutti gli appuntamenti
    if (bookingsCount.rows[0].total > 0) {
      const deletedBookings = await client.query('DELETE FROM bookings');
      console.log(`  ✅ Deleted ${deletedBookings.rowCount} bookings`);
    } else {
      console.log('  ℹ️ No bookings to delete');
    }

    // Cancella chiusure ricorrenti barbieri
    if (recurringCount.rows[0].total > 0) {
      const deletedRecurring = await client.query('DELETE FROM barber_recurring_closures');
      console.log(`  ✅ Deleted ${deletedRecurring.rowCount} recurring closures`);
    } else {
      console.log('  ℹ️ No recurring closures to delete');
    }

    // Cancella chiusure specifiche barbieri
    if (specificCount.rows[0].total > 0) {
      const deletedSpecific = await client.query('DELETE FROM barber_closures');
      console.log(`  ✅ Deleted ${deletedSpecific.rowCount} specific closures`);
    } else {
      console.log('  ℹ️ No specific closures to delete');
    }

    // Cancella impostazioni generali di chiusura
    if (generalCount.rows[0].total > 0) {
      const deletedGeneral = await client.query('DELETE FROM closure_settings');
      console.log(`  ✅ Deleted ${deletedGeneral.rowCount} general closure settings`);
    } else {
      console.log('  ℹ️ No general closure settings to delete');
    }

    // 4. Verifica finale
    console.log('\n📋 Final verification:');
    
    const finalBookings = await client.query('SELECT COUNT(*) as total FROM bookings');
    const finalRecurring = await client.query('SELECT COUNT(*) as total FROM barber_recurring_closures');
    const finalSpecific = await client.query('SELECT COUNT(*) as total FROM barber_closures');
    const finalGeneral = await client.query('SELECT COUNT(*) as total FROM closure_settings');
    
    console.log(`  📅 Bookings remaining: ${finalBookings.rows[0].total}`);
    console.log(`  🔄 Recurring closures remaining: ${finalRecurring.rows[0].total}`);
    console.log(`  🚫 Specific closures remaining: ${finalSpecific.rows[0].total}`);
    console.log(`  🏪 General closures remaining: ${finalGeneral.rows[0].total}`);

    // 5. Status degli schedule (non cancellati)
    const scheduleCount = await client.query('SELECT COUNT(*) as total FROM barber_schedules');
    console.log(`  📊 Schedule records preserved: ${scheduleCount.rows[0].total}`);

    const allClear = 
      finalBookings.rows[0].total == 0 && 
      finalRecurring.rows[0].total == 0 && 
      finalSpecific.rows[0].total == 0 && 
      finalGeneral.rows[0].total == 0;

    if (allClear) {
      console.log('\n🎉 ALL CLEAR! Database reset completed successfully!');
      console.log('📅 Schedule data preserved for future bookings');
      console.log('🚀 System ready for fresh configuration');
    } else {
      console.log('\n⚠️ Some data remains - please check manually');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
    console.log('\n🔚 Database connection closed');
  }
}

resetAllClosures();
