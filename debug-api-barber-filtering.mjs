import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Carica le variabili di ambiente
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function debugBarberFiltering() {
  console.log('🔍 DEBUGGING API BARBER FILTERING ISSUE');
  console.log('=====================================');
  
  try {
    // 1. Check all barbers
    console.log('\n📋 1. ALL BARBERS:');
    const barbers = await sql`SELECT id, name, email FROM barbers ORDER BY id`;
    barbers.forEach(barber => {
      console.log(`   ${barber.id} | ${barber.name} | ${barber.email}`);
    });
    
    // 2. Check all bookings for 2025-09-01
    console.log('\n📅 2. ALL BOOKINGS FOR 2025-09-01:');
    const bookings = await sql`
      SELECT id, barber_id, customer_name, time, service
      FROM bookings 
      WHERE date = '2025-09-01'
      ORDER BY time
    `;
    
    console.log(`   Total bookings: ${bookings.length}`);
    bookings.forEach(booking => {
      console.log(`   ${booking.id} | barber_id: ${booking.barber_id} | ${booking.customer_name} | ${booking.time} | ${booking.service}`);
    });
    
    // 3. Check specific barber filtering
    console.log('\n🔍 3. FILTERING BY SPECIFIC BARBERS:');
    
    for (const barber of barbers) {
      console.log(`\n   Filtering by ${barber.name} (${barber.email}):`);
      const filteredBookings = bookings.filter(booking => booking.barber_id === barber.id);
      console.log(`   → Found ${filteredBookings.length} bookings`);
      filteredBookings.forEach(booking => {
        console.log(`     • ${booking.customer_name} at ${booking.time}`);
      });
    }
    
    // 4. Check for orphaned bookings (barber_id not matching any barber)
    console.log('\n🚨 4. ORPHANED BOOKINGS (barber_id not found):');
    const barberIds = new Set(barbers.map(b => b.id));
    const orphanedBookings = bookings.filter(booking => !barberIds.has(booking.barber_id));
    
    if (orphanedBookings.length > 0) {
      console.log(`   ❌ Found ${orphanedBookings.length} orphaned bookings:`);
      orphanedBookings.forEach(booking => {
        console.log(`     • ${booking.customer_name} has barber_id: '${booking.barber_id}' (not found in barbers table)`);
      });
    } else {
      console.log('   ✅ No orphaned bookings found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugBarberFiltering();
