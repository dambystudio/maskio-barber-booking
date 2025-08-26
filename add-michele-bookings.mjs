import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function addMicheleBookings() {
    console.log('📅 Adding manual bookings for Michele...');
    
    try {
        // First, get Michele's barber data
        const michele = await sql`
            SELECT id, name, email 
            FROM barbers 
            WHERE name ILIKE '%michele%'
        `;
        
        if (michele.length === 0) {
            console.log('❌ Michele not found in barbers table');
            return;
        }
        
        console.log(`✅ Found barber: ${michele[0].name} (ID: ${michele[0].id})`);
        
        // Get a default service for pricing
        const services = await sql`
            SELECT id, name, price, duration 
            FROM services 
            LIMIT 3
        `;
        
        console.log('📋 Available services:');
        services.forEach(service => {
            console.log(`  - ${service.name}: €${service.price} (${service.duration}min)`);
        });
        
        // Default to "Taglio" service
        const taglioService = services.find(s => s.name.toLowerCase().includes('taglio')) || services[0];
        
        // Booking 1: Luigi Maresca - 1 settembre, 12:30
        const booking1 = {
            customerName: 'Luigi Maresca',
            customerEmail: 'Luigimaresca@gmail.com',
            customerPhone: '+39 327 687 5146',
            barberId: michele[0].id,
            barberName: michele[0].name,
            service: 'Taglio',
            price: taglioService.price,
            date: '2025-09-01',
            time: '12:30',
            duration: taglioService.duration,
            status: 'confirmed',
            notes: 'Prenotazione manuale aggiunta'
        };
        
        // Booking 2: Francesco Turco - 10 settembre, 10:30
        const booking2 = {
            customerName: 'Francesco Turco',
            customerEmail: '', // no email - use empty string instead of null
            customerPhone: '', // no phone - use empty string instead of null
            barberId: michele[0].id,
            barberName: michele[0].name,
            service: 'Taglio',
            price: taglioService.price,
            date: '2025-09-10',
            time: '10:30',
            duration: taglioService.duration,
            status: 'confirmed',
            notes: 'Prenotazione manuale aggiunta - no contatti'
        };
        
        console.log('\n📝 Creating booking 1: Luigi Maresca...');
        
        // Check if booking already exists for Luigi
        const existingLuigi = await sql`
            SELECT id FROM bookings 
            WHERE customer_name = ${booking1.customerName}
            AND date = ${booking1.date}
            AND time = ${booking1.time}
        `;
        
        if (existingLuigi.length > 0) {
            console.log('⚠️ Booking for Luigi already exists, skipping...');
        } else {
            const [newBooking1] = await sql`
                INSERT INTO bookings (
                    customer_name, customer_email, customer_phone,
                    barber_id, barber_name, service, price,
                    date, time, duration, status, notes
                ) VALUES (
                    ${booking1.customerName}, ${booking1.customerEmail}, ${booking1.customerPhone},
                    ${booking1.barberId}, ${booking1.barberName}, ${booking1.service}, ${booking1.price},
                    ${booking1.date}, ${booking1.time}, ${booking1.duration}, ${booking1.status}, ${booking1.notes}
                ) RETURNING id, customer_name, date, time
            `;
            
            console.log(`✅ Created booking 1: ${newBooking1.customer_name} on ${newBooking1.date} at ${newBooking1.time}`);
        }
        
        console.log('\n📝 Creating booking 2: Francesco Turco...');
        
        // Check if booking already exists for Francesco
        const existingFrancesco = await sql`
            SELECT id FROM bookings 
            WHERE customer_name = ${booking2.customerName}
            AND date = ${booking2.date}
            AND time = ${booking2.time}
        `;
        
        if (existingFrancesco.length > 0) {
            console.log('⚠️ Booking for Francesco already exists, skipping...');
        } else {
            const [newBooking2] = await sql`
                INSERT INTO bookings (
                    customer_name, customer_email, customer_phone,
                    barber_id, barber_name, service, price,
                    date, time, duration, status, notes
                ) VALUES (
                    ${booking2.customerName}, ${booking2.customerEmail}, ${booking2.customerPhone},
                    ${booking2.barberId}, ${booking2.barberName}, ${booking2.service}, ${booking2.price},
                    ${booking2.date}, ${booking2.time}, ${booking2.duration}, ${booking2.status}, ${booking2.notes}
                ) RETURNING id, customer_name, date, time
            `;
            
            console.log(`✅ Created booking 2: ${newBooking2.customer_name} on ${newBooking2.date} at ${newBooking2.time}`);
        }
        
        // Verify bookings were created
        console.log('\n📊 Verifying Michele\'s bookings for September...');
        const micheleBookings = await sql`
            SELECT customer_name, customer_email, customer_phone, date, time, service, status
            FROM bookings 
            WHERE barber_id = ${michele[0].id}
            AND date >= '2025-09-01'
            AND date <= '2025-09-30'
            ORDER BY date, time
        `;
        
        console.log(`✅ Michele has ${micheleBookings.length} bookings in September:`);
        micheleBookings.forEach(booking => {
            const email = booking.customer_email || 'No email';
            const phone = booking.customer_phone || 'No phone';
            console.log(`  📅 ${booking.date} ${booking.time} - ${booking.customer_name}`);
            console.log(`     📧 ${email} | 📱 ${phone} | 💺 ${booking.service} | 📊 ${booking.status}`);
        });
        
    } catch (error) {
        console.error('❌ Error adding bookings:', error);
    }
}

addMicheleBookings();
