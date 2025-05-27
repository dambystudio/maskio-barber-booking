// Seed script to populate database with initial data
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    const sql = neon(DATABASE_URL);
    
    // Clear all data in the correct order (respecting foreign key constraints)
    console.log('🧹 Clearing existing data...');
    await sql`DELETE FROM bookings`;
    await sql`DELETE FROM barber_schedules`;
    await sql`DELETE FROM barbers`;
    await sql`DELETE FROM services`;
    console.log('✅ Existing data cleared');
    
    // Create default services
    console.log('📋 Creating services...');
    
    const services = [
      {
        name: 'Taglio & Styling',
        description: 'Tagli personalizzati per esaltare la tua personalità e stile',
        price: '25.00',
        duration: 45
      },
      {
        name: 'Rasatura Tradizionale',
        description: 'L\'arte della rasatura con rasoio a mano libera',
        price: '20.00',
        duration: 30
      },
      {
        name: 'Trattamenti Barba',
        description: 'Cura completa per una barba sempre perfetta',
        price: '15.00',
        duration: 30
      },
      {
        name: 'Pacchetto Completo',
        description: 'Taglio + Rasatura + Trattamento Barba',
        price: '50.00',
        duration: 90
      }
    ];

    for (const service of services) {
      await sql`
        INSERT INTO services (name, description, price, duration)
        VALUES (${service.name}, ${service.description}, ${service.price}, ${service.duration})
      `;
      console.log(`✅ Service created: ${service.name}`);
    }

    // Create default barbers
    console.log('👨‍💼 Creating barbers...');
    
    const barbers = [
      {
        name: 'Michele',
        specialties: JSON.stringify(['Taglio Classico', 'Rasatura', 'Barba'])
      },
      {
        name: 'Fabio',
        specialties: JSON.stringify(['Taglio Moderno', 'Styling', 'Trattamenti'])
      }    ];

    for (const barber of barbers) {
      await sql`
        INSERT INTO barbers (name, specialties)
        VALUES (${barber.name}, ${barber.specialties})
      `;
      console.log(`✅ Barber created: ${barber.name}`);
    }

    // Get created barber IDs
    const createdBarbers = await sql`SELECT id, name FROM barbers`;
    console.log('📊 Created barbers:', createdBarbers);    // Create schedules for the next 30 days
    console.log('📅 Creating schedules...');
    
    const defaultTimeSlots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
    ];

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      // Skip Sundays (day 0)
      if (date.getDay() === 0) continue;

      for (const barber of createdBarbers) {
        await sql`
          INSERT INTO barber_schedules (barber_id, date, available_slots, unavailable_slots, day_off)
          VALUES (${barber.id}, ${dateString}, ${JSON.stringify(defaultTimeSlots)}, ${JSON.stringify([])}, false)
        `;
      }
    }

    console.log('✅ Database seeding completed!');
    
    // Show summary
    const serviceCount = await sql`SELECT COUNT(*) as count FROM services`;
    const barberCount = await sql`SELECT COUNT(*) as count FROM barbers`;
    const scheduleCount = await sql`SELECT COUNT(*) as count FROM barber_schedules`;
    
    console.log('📊 Summary:');
    console.log(`   - Services: ${serviceCount[0].count}`);
    console.log(`   - Barbers: ${barberCount[0].count}`);
    console.log(`   - Schedules: ${scheduleCount[0].count}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seedDatabase();
