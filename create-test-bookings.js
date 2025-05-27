const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function createTestBookings() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    console.log('🔧 Creating test bookings...');

    // Get barber IDs first
    const barbers = await sql`SELECT id, name FROM barbers`;
    console.log('👨‍💼 Available barbers:', barbers.map(b => `${b.name} (${b.id})`));

    // Get service names
    const services = await sql`SELECT name, price FROM services`;
    console.log('🛠️ Available services:', services.map(s => `${s.name} - €${s.price}`));

    // Create test bookings with realistic data
    const testBookings = [
      {
        customer_name: 'Mario Rossi',
        customer_email: 'mario.rossi@email.com',
        customer_phone: '+39 333 1234567',
        barber_id: barbers[0].id,
        barber_name: barbers[0].name,
        service: services[0].name,
        price: services[0].price,
        date: '2025-05-27', // Domani
        time: '10:00',
        duration: 30,
        status: 'confirmed',
        notes: 'Cliente abituale'
      },
      {
        customer_name: 'Luigi Bianchi',
        customer_email: 'luigi.bianchi@email.com',
        customer_phone: '+39 333 7654321',
        barber_id: barbers[1].id,
        barber_name: barbers[1].name,
        service: services[1].name,
        price: services[1].price,
        date: '2025-05-27',
        time: '14:30',
        duration: 45,
        status: 'pending',
        notes: 'Prima volta'
      },
      {
        customer_name: 'Giuseppe Verdi',
        customer_email: 'giuseppe.verdi@email.com',
        customer_phone: '+39 333 9876543',
        barber_id: barbers[0].id,
        barber_name: barbers[0].name,
        service: services[2].name,
        price: services[2].price,
        date: '2025-05-26', // Oggi
        time: '16:00',
        duration: 60,
        status: 'confirmed',
        notes: 'Barba e capelli'
      },
      {
        customer_name: 'Antonio Ferrari',
        customer_email: 'antonio.ferrari@email.com',
        customer_phone: '+39 333 1111222',
        barber_id: barbers[1].id,
        barber_name: barbers[1].name,
        service: services[0].name,
        price: services[0].price,
        date: '2025-05-28',
        time: '09:30',
        duration: 30,
        status: 'cancelled',
        notes: 'Annullato per imprevisto'
      },
      {
        customer_name: 'Francesco Ricci',
        customer_email: 'francesco.ricci@email.com',
        customer_phone: '+39 333 5555666',
        barber_id: barbers[0].id,
        barber_name: barbers[0].name,
        service: services[3].name,
        price: services[3].price,
        date: '2025-05-26', // Oggi
        time: '11:30',
        duration: 45,
        status: 'confirmed',
        notes: 'Trattamento completo'
      }
    ];

    console.log('📝 Inserting test bookings...');
    
    for (const booking of testBookings) {
      await sql`
        INSERT INTO bookings (
          user_id, customer_name, customer_email, customer_phone,
          barber_id, barber_name, service, price, date, time,
          duration, status, notes
        ) VALUES (
          gen_random_uuid(),
          ${booking.customer_name},
          ${booking.customer_email},
          ${booking.customer_phone},
          ${booking.barber_id},
          ${booking.barber_name},
          ${booking.service},
          ${booking.price},
          ${booking.date},
          ${booking.time},
          ${booking.duration},
          ${booking.status},
          ${booking.notes}
        )
      `;
      console.log(`✅ Created booking for ${booking.customer_name} - ${booking.date} ${booking.time}`);
    }

    // Verify bookings were created
    const bookingCount = await sql`SELECT COUNT(*) as count FROM bookings`;
    console.log(`\n🎉 Total bookings now: ${bookingCount[0].count}`);

    // Show sample bookings
    const sampleBookings = await sql`
      SELECT customer_name, date, time, status, barber_name, service 
      FROM bookings 
      ORDER BY date, time
    `;
    
    console.log('\n📋 All bookings:');
    sampleBookings.forEach(booking => {
      console.log(`  ${booking.customer_name} - ${booking.date} ${booking.time} - ${booking.status} (${booking.barber_name} - ${booking.service})`);
    });

  } catch (error) {
    console.error('💥 Error creating test bookings:', error);
  }
}

createTestBookings();
