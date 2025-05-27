import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function checkBookings() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    console.log('🔍 Checking existing bookings...\n');

    // Check total bookings
    const totalBookings = await sql`SELECT COUNT(*) as count FROM bookings`;
    console.log(`📊 Total bookings in database: ${totalBookings[0].count}`);

    if (totalBookings[0].count > 0) {
      // Show all bookings grouped by date
      const bookingsByDate = await sql`
        SELECT 
          date,
          time,
          customer_name,
          barber_name,
          service,
          status
        FROM bookings 
        ORDER BY date, time
      `;

      console.log('\n📋 All bookings by date:');
      let currentDate = '';
      bookingsByDate.forEach(booking => {
        if (booking.date !== currentDate) {
          currentDate = booking.date;
          console.log(`\n📅 ${booking.date}:`);
        }
        console.log(`  ${booking.time} - ${booking.customer_name} (${booking.barber_name}) - ${booking.service} [${booking.status}]`);
      });

      // Check for today's bookings
      const today = '2025-05-27';
      const todayBookings = await sql`
        SELECT customer_name, time, barber_name, service, status 
        FROM bookings 
        WHERE date = ${today}
        ORDER BY time
      `;

      console.log(`\n🗓️ Today's bookings (${today}): ${todayBookings.length}`);
      todayBookings.forEach(booking => {
        console.log(`  ${booking.time} - ${booking.customer_name} (${booking.barber_name}) - ${booking.service} [${booking.status}]`);
      });

    } else {
      console.log('⚠️ No bookings found in database!');
      console.log('📝 Creating some test bookings...');
      
      // Create test bookings
      const barbers = await sql`SELECT id, name FROM barbers LIMIT 2`;
      const services = await sql`SELECT name, price FROM services LIMIT 1`;
      
      if (barbers.length > 0 && services.length > 0) {
        await sql`
          INSERT INTO bookings (
            user_id, customer_name, customer_email, customer_phone,
            barber_id, barber_name, service, price, date, time,
            duration, status, notes
          ) VALUES (
            gen_random_uuid(),
            'Mario Rossi',
            'mario.rossi@email.com',
            '+39 333 1234567',
            ${barbers[0].id},
            ${barbers[0].name},
            ${services[0].name},
            ${services[0].price},
            '2025-05-27',
            '10:00',
            30,
            'confirmed',
            'Test booking'
          )
        `;
        
        await sql`
          INSERT INTO bookings (
            user_id, customer_name, customer_email, customer_phone,
            barber_id, barber_name, service, price, date, time,
            duration, status, notes
          ) VALUES (
            gen_random_uuid(),
            'Luigi Bianchi',
            'luigi.bianchi@email.com',
            '+39 333 7654321',
            ${barbers[0].id},
            ${barbers[0].name},
            ${services[0].name},
            ${services[0].price},
            '2025-05-28',
            '14:30',
            30,
            'pending',
            'Test booking 2'
          )
        `;
        
        console.log('✅ Created test bookings for today and tomorrow');
      }
    }

  } catch (error) {
    console.error('💥 Error checking bookings:', error);
  }
}

checkBookings();
