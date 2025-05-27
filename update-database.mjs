import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function updateDatabase() {
  console.log('🔄 Updating database with correct services and barbers...');
  
  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await sql`DELETE FROM bookings`;
    await sql`DELETE FROM barber_schedules`;
    await sql`DELETE FROM services`;
    await sql`DELETE FROM barbers`;
    console.log('✅ Existing data cleared');
    
    // Create services with the IDs expected by BookingForm
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
      },
      {
        id: 'skincare',
        name: 'Skincare',
        description: 'Trattamento cura viso',
        price: '30.00',
        duration: 45
      },
      {
        id: 'trattamento-barba',
        name: 'Trattamento Barba',
        description: 'Pulizia barba, modellatura, contorno e acconciatura',
        price: '25.00',
        duration: 40
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
    console.log('👨‍💼 Creating barbers with correct IDs...');
    
    const barbers = [
      {
        id: 'fabio',
        name: 'Fabio',
        email: 'fabio@maskiobarber.com',
        phone: '+39 123 456 7890',
        specialties: JSON.stringify(['Tagli classici', 'Skin Care', 'Trattamenti barba']),
        experience: '8 anni di esperienza',
        isActive: true
      },
      {
        id: 'michele',
        name: 'Michele',
        email: 'michele@maskiobarber.com',
        phone: '+39 123 456 7891',
        specialties: JSON.stringify(['Tagli moderni', 'Barba', 'Skin Care']),
        experience: '6 anni di esperienza',
        isActive: true
      }
    ];

    for (const barber of barbers) {
      await sql`
        INSERT INTO barbers (id, name, email, phone, specialties, is_active)
        VALUES (${barber.id}, ${barber.name}, ${barber.email}, ${barber.phone}, ${barber.specialties}, ${barber.isActive})
      `;
      console.log(`✅ Barber created: ${barber.name} (ID: ${barber.id})`);
    }

    // Create default schedules for both barbers
    console.log('📅 Setting up default schedules...');
    
    const defaultTimeSlots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
    ];

    // Set schedules for the next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      // Skip Sundays (day 0)
      if (date.getDay() === 0) continue;

      for (const barber of barbers) {
        await sql`
          INSERT INTO barber_schedules (barber_id, date, day_off, available_slots, unavailable_slots)
          VALUES (${barber.id}, ${dateString}, false, ${JSON.stringify(defaultTimeSlots)}, ${JSON.stringify([])})
        `;
      }
    }
    
    console.log('✅ Schedules created for next 30 days');

    // Summary
    const serviceCount = await sql`SELECT COUNT(*) as count FROM services`;
    const barberCount = await sql`SELECT COUNT(*) as count FROM barbers`;
    const scheduleCount = await sql`SELECT COUNT(*) as count FROM barber_schedules`;
    
    console.log('📊 Database updated successfully:');
    console.log(`   - Services: ${serviceCount[0].count}`);
    console.log(`   - Barbers: ${barberCount[0].count}`);
    console.log(`   - Schedules: ${scheduleCount[0].count}`);

  } catch (error) {
    console.error('❌ Update failed:', error);
  }
}

updateDatabase();
