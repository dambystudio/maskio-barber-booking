// Migration script to transfer data from local JSON to PostgreSQL
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { DatabaseService } from './src/lib/database-postgres.js';

async function migrateData() {
  console.log('🚀 Starting data migration to PostgreSQL...');

  try {
    // Check if local data files exist
    const dataDir = join(process.cwd(), 'data');
    const bookingsFile = join(dataDir, 'bookings.json');

    if (existsSync(bookingsFile)) {
      console.log('📖 Reading existing bookings...');
      const bookingsData = JSON.parse(readFileSync(bookingsFile, 'utf8'));

      if (bookingsData.length > 0) {
        console.log(`📊 Found ${bookingsData.length} bookings to migrate`);

        for (const booking of bookingsData) {
          try {
            // Map old booking structure to new schema
            const newBooking = {
              customerName: booking.customerName,
              customerEmail: booking.customerEmail,
              customerPhone: booking.customerPhone,
              barberId: booking.barberId || 'default-barber-id', // We'll need to create default barbers
              barberName: booking.barberName,
              service: booking.service,
              price: booking.price.toString(),
              date: booking.date,
              time: booking.time,
              duration: booking.duration || 60,
              status: booking.status || 'confirmed',
              notes: booking.notes || null,
            };

            await DatabaseService.createBooking(newBooking);
            console.log(`✅ Migrated booking: ${booking.customerName} - ${booking.date} ${booking.time}`);
          } catch (error) {
            console.error(`❌ Failed to migrate booking ${booking.id}:`, error);
          }
        }
      }
    }

    // Create default barbers
    console.log('👨‍💼 Creating default barbers...');
    
    const defaultBarbers = [
      {
        name: 'Michele',
        specialties: JSON.stringify(['Taglio Classico', 'Rasatura', 'Barba']),
        isActive: true,
      },
      {
        name: 'Fabio',
        specialties: JSON.stringify(['Taglio Moderno', 'Styling', 'Trattamenti']),
        isActive: true,
      }
    ];

    for (const barber of defaultBarbers) {
      try {
        await DatabaseService.createBarber(barber);
        console.log(`✅ Created barber: ${barber.name}`);
      } catch (error) {
        console.log(`ℹ️ Barber ${barber.name} might already exist`);
      }
    }

    // Create default services
    console.log('💼 Creating default services...');
    
    const defaultServices = [
      {
        name: 'Taglio & Styling',
        description: 'Tagli personalizzati per esaltare la tua personalità e stile',
        price: '25.00',
        duration: 45,
        isActive: true,
      },
      {
        name: 'Rasatura Tradizionale',
        description: 'L\'arte della rasatura con rasoio a mano libera',
        price: '20.00',
        duration: 30,
        isActive: true,
      },
      {
        name: 'Trattamenti Barba',
        description: 'Cura completa per una barba sempre perfetta',
        price: '15.00',
        duration: 30,
        isActive: true,
      },
      {
        name: 'Pacchetto Completo',
        description: 'Taglio + Rasatura + Trattamento Barba',
        price: '50.00',
        duration: 90,
        isActive: true,
      }
    ];

    for (const service of defaultServices) {
      try {
        await DatabaseService.createService(service);
        console.log(`✅ Created service: ${service.name}`);
      } catch (error) {
        console.log(`ℹ️ Service ${service.name} might already exist`);
      }
    }

    // Create default schedules for barbers
    console.log('📅 Setting up default schedules...');
    
    const barbers = await DatabaseService.getAllBarbers();
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
        try {
          await DatabaseService.setBarberSchedule({
            barberId: barber.id,
            date: dateString,
            availableSlots: JSON.stringify(defaultTimeSlots),
            unavailableSlots: JSON.stringify([]),
            dayOff: false,
          });
        } catch (error) {
          // Schedule might already exist, that's ok
        }
      }
    }

    console.log('✅ Migration completed successfully!');
    console.log('📊 Database statistics:');
    
    const stats = await DatabaseService.getBookingStats();
    console.log(`   - Total bookings: ${stats.totalBookings}`);
    console.log(`   - Active barbers: ${barbers.length}`);
    console.log(`   - Available services: ${defaultServices.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateData();
