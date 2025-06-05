import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function recreateDatabase() {
  console.log('🔄 Recreating database with correct schema...');
  
  try {
    // Drop all tables in correct order (respecting foreign key constraints)
    console.log('🗑️ Dropping existing tables...');
    await sql`DROP TABLE IF EXISTS bookings CASCADE`;
    await sql`DROP TABLE IF EXISTS barber_schedules CASCADE`;
    await sql`DROP TABLE IF EXISTS barbers CASCADE`;
    await sql`DROP TABLE IF EXISTS services CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    console.log('✅ Tables dropped');
    
    // Create tables with correct schema
    console.log('🏗️ Creating tables with new schema...');
    
    // Users table
    await sql`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'customer',
        phone VARCHAR(20),
        password TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        last_login TIMESTAMP
      )
    `;
    
    // Services table with custom VARCHAR IDs
    await sql`
      CREATE TABLE services (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        duration INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
      // Barbers table with custom VARCHAR IDs
    await sql`
      CREATE TABLE barbers (
        id VARCHAR(50) PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        specialties TEXT,
        experience TEXT,
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Bookings table
    await sql`
      CREATE TABLE bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        barber_id VARCHAR(50) REFERENCES barbers(id),
        barber_name VARCHAR(255) NOT NULL,
        service VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        date VARCHAR(10) NOT NULL,
        time VARCHAR(5) NOT NULL,
        duration INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Barber schedules table
    await sql`
      CREATE TABLE barber_schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        barber_id VARCHAR(50) REFERENCES barbers(id),
        date VARCHAR(10) NOT NULL,
        available_slots TEXT,
        unavailable_slots TEXT,
        day_off BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    console.log('✅ Tables created with new schema');
    
    // Now populate with correct data
    console.log('📋 Creating services with correct IDs...');
      const services = [
      {
        id: 'taglio',
        name: 'Taglio',
        description: 'Taglio di capelli personalizzato',
        price: '18.00',
        duration: 30
      },
      {
        id: 'barba',
        name: 'Barba',
        description: 'Modellatura e contorno barba',
        price: '10.00',
        duration: 15
      },
      {
        id: 'taglio-e-barba',
        name: 'Taglio e Barba',
        description: 'Taglio capelli e sistemazione barba',
        price: '23.00',
        duration: 40
      },      {
        id: 'altri-servizi',
        name: 'Altri servizi',
        description: 'colore o altri servizi',
        price: '0.00',
        duration: 30
      }
    ];

    for (const service of services) {
      await sql`
        INSERT INTO services (id, name, description, price, duration, is_active)
        VALUES (${service.id}, ${service.name}, ${service.description}, ${service.price}, ${service.duration}, true)
      `;
      console.log(`✅ Service created: ${service.name} (ID: ${service.id})`);
    }

    // Create barbers with the IDs expected by BookingForm
    console.log('👨‍💼 Creating barbers with correct IDs...');    const barbers = [
      {
        id: 'fabio',
        name: 'Fabio',
        email: 'fabio@maskiobarber.com',
        phone: '+39 123 456 7890',
        specialties: JSON.stringify(['Tagli moderni', 'Tagli classici', 'Barba'])
      },
      {
        id: 'michele',
        name: 'Michele',
        email: 'michele@maskiobarber.com',
        phone: '+39 123 456 7891',
        specialties: JSON.stringify(['Tagli moderni', 'Tagli classici', 'Barba'])
      }
    ];

    for (const barber of barbers) {
      await sql`
        INSERT INTO barbers (id, name, email, phone, specialties, is_active)
        VALUES (${barber.id}, ${barber.name}, ${barber.email}, ${barber.phone}, ${barber.specialties}, true)
      `;
      console.log(`✅ Barber created: ${barber.name} (ID: ${barber.id})`);
    }    // Create default schedules for both barbers
    console.log('📅 Setting up default schedules...');
      // Orari corretti: mattina 09:00-12:30, pomeriggio 15:00-17:30
    const weekdayTimeSlots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
      "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
    ];
    
    // Sabato ha gli stessi orari dei giorni feriali (mattina + pomeriggio)
    const saturdayTimeSlots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
      "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
    ];

    // Set schedules for the next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
        // Skip Sundays (day 0)
      if (date.getDay() === 0) continue;

      // Determine time slots based on day
      const isSaturday = date.getDay() === 6;
      const timeSlots = isSaturday ? saturdayTimeSlots : weekdayTimeSlots;

      for (const barber of barbers) {
        await sql`
          INSERT INTO barber_schedules (barber_id, date, day_off, available_slots, unavailable_slots)
          VALUES (${barber.id}, ${dateString}, false, ${JSON.stringify(timeSlots)}, ${JSON.stringify([])})
        `;
      }
    }
    
    console.log('✅ Schedules created for next 30 days');

    // Summary
    const serviceCount = await sql`SELECT COUNT(*) as count FROM services`;
    const barberCount = await sql`SELECT COUNT(*) as count FROM barbers`;
    const scheduleCount = await sql`SELECT COUNT(*) as count FROM barber_schedules`;
    
    console.log('🎉 Database recreated successfully:');
    console.log(`   - Services: ${serviceCount[0].count}`);
    console.log(`   - Barbers: ${barberCount[0].count}`);
    console.log(`   - Schedules: ${scheduleCount[0].count}`);

  } catch (error) {
    console.error('❌ Recreation failed:', error);
  }
}

recreateDatabase();
