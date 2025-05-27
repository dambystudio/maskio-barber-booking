// Create test bookings directly in database
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createTestBookings() {
  try {
    console.log('🔧 Creating test bookings...');

    // First get barber IDs
    const barbers = await sql`SELECT id, name FROM barbers ORDER BY name`;
    console.log('👨‍💼 Found barbers:', barbers.map(b => `${b.name} (${b.id.slice(0, 8)}...)`));

    if (barbers.length === 0) {
      console.log('❌ No barbers found. Run seed-db.js first.');
      return;
    }

    // Create test users first
    console.log('👤 Creating test users...');
    const testUsers = [
      {
        name: 'Mario Rossi',
        email: 'mario.rossi@email.com',
        phone: '+39 333 1234567'
      },
      {
        name: 'Luigi Bianchi', 
        email: 'luigi.bianchi@email.com',
        phone: '+39 333 7654321'
      },
      {
        name: 'Giuseppe Verdi',
        email: 'giuseppe.verdi@email.com', 
        phone: '+39 333 9876543'
      },
      {
        name: 'Antonio Ferrari',
        email: 'antonio.ferrari@email.com',
        phone: '+39 333 1111222'
      }
    ];

    const createdUsers = [];
    for (const user of testUsers) {
      // Check if user already exists
      const existing = await sql`SELECT id FROM users WHERE email = ${user.email}`;
      
      if (existing.length > 0) {
        console.log(`👤 User ${user.name} already exists`);
        createdUsers.push(existing[0]);
      } else {        const [newUser] = await sql`
          INSERT INTO users (name, email, phone, created_at)
          VALUES (${user.name}, ${user.email}, ${user.phone}, NOW())
          RETURNING id
        `;
        console.log(`✅ Created user: ${user.name}`);
        createdUsers.push(newUser);
      }
    }

    const testBookings = [
      {
        user_id: createdUsers[0].id,
        customer_name: 'Mario Rossi',
        customer_email: 'mario.rossi@email.com',
        customer_phone: '+39 333 1234567',
        barber_id: barbers[0].id,
        barber_name: barbers[0].name,
        service: 'Taglio Uomo',
        price: 25,
        date: '2025-05-27', // Tomorrow
        time: '10:00',
        duration: 30,
        status: 'confirmed',
        notes: 'Cliente abituale'
      },
      {
        user_id: createdUsers[1].id,
        customer_name: 'Luigi Bianchi',
        customer_email: 'luigi.bianchi@email.com',
        customer_phone: '+39 333 7654321',
        barber_id: barbers[1]?.id || barbers[0].id,
        barber_name: barbers[1]?.name || barbers[0].name,
        service: 'Barba',
        price: 15,
        date: '2025-05-26', // Today
        time: '14:30',
        duration: 20,
        status: 'pending',
        notes: 'Da confermare'
      },
      {
        user_id: createdUsers[2].id,
        customer_name: 'Giuseppe Verdi',
        customer_email: 'giuseppe.verdi@email.com',
        customer_phone: '+39 333 9876543',
        barber_id: barbers[0].id,
        barber_name: barbers[0].name,
        service: 'Taglio + Barba',
        price: 35,
        date: '2025-05-26', // Today
        time: '16:00',
        duration: 45,
        status: 'confirmed',
        notes: 'Servizio completo'
      },
      {
        user_id: createdUsers[3].id,
        customer_name: 'Antonio Ferrari',
        customer_email: 'antonio.ferrari@email.com',
        customer_phone: '+39 333 1111222',
        barber_id: barbers[1]?.id || barbers[0].id,
        barber_name: barbers[1]?.name || barbers[0].name,
        service: 'Taglio Uomo',
        price: 25,
        date: '2025-05-28',
        time: '09:30',
        duration: 30,
        status: 'cancelled',
        notes: 'Annullato per imprevisto'
      }
    ];

    console.log('📝 Inserting test bookings...');

    for (const booking of testBookings) {
      await sql`
        INSERT INTO bookings (
          user_id, customer_name, customer_email, customer_phone,
          barber_id, barber_name, service, price, date, time,
          duration, status, notes, created_at, updated_at
        ) VALUES (
          ${booking.user_id},
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
          ${booking.notes},
          NOW(),
          NOW()
        )
      `;
      console.log(`✅ Created: ${booking.customer_name} - ${booking.date} ${booking.time} (${booking.status})`);
    }

    // Verify bookings were created
    const bookingCount = await sql`SELECT COUNT(*) as count FROM bookings`;
    console.log(`\n🎉 Total bookings in database: ${bookingCount[0].count}`);

    // Show recent bookings
    const recentBookings = await sql`
      SELECT customer_name, date, time, status, barber_name, service 
      FROM bookings 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    console.log('\n📋 Recent bookings:');
    recentBookings.forEach(booking => {
      const statusEmoji = booking.status === 'confirmed' ? '✅' : booking.status === 'pending' ? '⏳' : '❌';
      console.log(`  ${statusEmoji} ${booking.customer_name} - ${booking.date} ${booking.time} - ${booking.barber_name} (${booking.service})`);
    });

    console.log('\n🔗 Now check the panel at: http://localhost:3001/pannello-prenotazioni');
    console.log('🔑 Use credentials: admin / barber2025');

  } catch (error) {
    console.error('💥 Error creating test bookings:', error);
  }
}

createTestBookings();
