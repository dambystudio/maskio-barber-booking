const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkBookings() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    console.log('🔍 Checking bookings in database...');

    // Check if bookings table exists and has data   
    const bookings = await sql`SELECT COUNT(*) as count FROM bookings`;
    console.log('📊 Total bookings in database:', bookings[0].count);

    if (bookings[0].count > 0) {
      const sampleBookings = await sql`SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5`;
      console.log('📋 Sample bookings:');
      sampleBookings.forEach(booking => {
        console.log(`  - ${booking.customer_name} - ${booking.date} ${booking.time} - ${booking.status}`);
      });
    } else {
      console.log('❌ No bookings found in database'); 
      console.log('🔧 Need to create test bookings');
      
      // Let's also check if the table structure is correct
      const tableInfo = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        ORDER BY ordinal_position
      `;
      
      console.log('📊 Table structure:');
      tableInfo.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    }
    
    // Also check other tables
    console.log('\n🔍 Checking other tables...');
    const services = await sql`SELECT COUNT(*) as count FROM services`;
    console.log('🛠️ Services count:', services[0].count);
    
    const barbers = await sql`SELECT COUNT(*) as count FROM barbers`;
    console.log('✂️ Barbers count:', barbers[0].count);
    
    const schedules = await sql`SELECT COUNT(*) as count FROM barber_schedules`;
    console.log('📅 Schedules count:', schedules[0].count);
    
  } catch (error) {
    console.error('💥 Error checking database:', error);
  }
}

checkBookings();
