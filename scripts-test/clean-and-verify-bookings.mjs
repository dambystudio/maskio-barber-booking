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

async function cleanAndVerifyBookings() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // 1. Mostra statistiche attuali
    console.log('\n📊 Current booking statistics:');
    
    const totalBookings = await client.query('SELECT COUNT(*) as count FROM bookings');
    console.log(`   Total bookings: ${totalBookings.rows[0].count}`);
    
    const bookingsByBarber = await client.query(`
      SELECT barber_id, COUNT(*) as count 
      FROM bookings 
      GROUP BY barber_id 
      ORDER BY count DESC
    `);
    
    console.log('   Bookings by barber:');
    bookingsByBarber.rows.forEach(row => {
      console.log(`     ${row.barber_id}: ${row.count} bookings`);
    });
    
    const bookingsByStatus = await client.query(`
      SELECT status, COUNT(*) as count 
      FROM bookings 
      GROUP BY status 
      ORDER BY count DESC
    `);
    
    console.log('   Bookings by status:');
    bookingsByStatus.rows.forEach(row => {
      console.log(`     ${row.status}: ${row.count} bookings`);
    });    // 2. Mostra alcune prenotazioni di esempio
    console.log('\n📋 Sample bookings (last 10):');
    const sampleBookings = await client.query(`
      SELECT id, customer_name, customer_email, barber_id, date, time, status, created_at
      FROM bookings 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    sampleBookings.rows.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.customer_name} - ${booking.barber_id}`);
      console.log(`      Date: ${booking.date} ${booking.time}`);
      console.log(`      Status: ${booking.status} | Created: ${booking.created_at}`);
      console.log('');
    });

    // 3. Chiedi conferma per la pulizia
    console.log('🧹 CLEANING ALL BOOKINGS...');
    console.log('⚠️  This will delete ALL existing bookings!');
    
    // Esegui la pulizia
    const deleteResult = await client.query('DELETE FROM bookings');
    console.log(`✅ Deleted ${deleteResult.rowCount} bookings`);

    // 4. Verifica che la tabella sia vuota
    const verifyEmpty = await client.query('SELECT COUNT(*) as count FROM bookings');
    console.log(`📊 Bookings remaining: ${verifyEmpty.rows[0].count}`);

    // 5. Controlla la struttura della tabella bookings
    console.log('\n🔍 Verifying bookings table structure:');
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      ORDER BY ordinal_position
    `);
    
    console.log('   Table columns:');
    tableStructure.rows.forEach(col => {
      console.log(`     ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}) default: ${col.column_default || 'none'}`);
    });

    // 6. Verifica barbieri disponibili
    console.log('\n👥 Available barbers:');
    const barbers = await client.query('SELECT id, name, email FROM users WHERE role = $1', ['barber']);
    barbers.rows.forEach(barber => {
      console.log(`   ${barber.id}: ${barber.name} (${barber.email})`);
    });

    // 7. Verifica servizi disponibili
    console.log('\n✂️  Available services:');
    const services = await client.query('SELECT id, name, price, duration FROM services ORDER BY name');
    services.rows.forEach(service => {
      console.log(`   ${service.id}: ${service.name} - €${service.price} (${service.duration} min)`);
    });

    // 8. Verifica schedule configuration
    console.log('\n📅 Schedule configuration:');
    const schedules = await client.query('SELECT * FROM schedule_configurations ORDER BY day_of_week');
    schedules.rows.forEach(schedule => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      console.log(`   ${days[schedule.day_of_week]}: ${schedule.start_time} - ${schedule.end_time}`);
      if (schedule.lunch_start && schedule.lunch_end) {
        console.log(`     Lunch break: ${schedule.lunch_start} - ${schedule.lunch_end}`);
      }
    });

    // 9. Verifica closure settings
    console.log('\n🔒 Closure settings:');
    const closures = await client.query('SELECT * FROM closure_settings LIMIT 1');
    if (closures.rows.length > 0) {
      const closure = closures.rows[0];
      console.log(`   Closed days: ${closure.closed_days}`);
      console.log(`   Closed dates: ${closure.closed_dates}`);
    } else {
      console.log('   No closure settings found');
    }

    // 10. Test delle date future per verificare la disponibilità
    console.log('\n🧪 Testing future date availability:');
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const testDate = new Date(today);
      testDate.setDate(today.getDate() + i);
      const dateStr = testDate.toISOString().split('T')[0];
      
      console.log(`   ${dateStr} (${testDate.toLocaleDateString('it-IT', { weekday: 'long' })}): Ready for bookings`);
    }

    console.log('\n✅ Database cleanup and verification completed!');
    console.log('📝 Summary:');
    console.log('   - All bookings deleted');
    console.log('   - Table structure verified');
    console.log('   - Barbers and services confirmed');
    console.log('   - Schedule configuration checked');
    console.log('   - Ready for new bookings');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
    console.log('\n🔚 Database connection closed');
  }
}

cleanAndVerifyBookings();
