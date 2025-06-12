// Test della struttura del database per il sistema di prenotazioni
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function testDatabaseStructure() {
  console.log('🔍 Testing Database Structure for Bookings...\n');
  
  try {
    // 1. Check tables exist
    console.log('1️⃣ Checking required tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'barbers', 'services', 'bookings')
      ORDER BY table_name
    `;
    
    console.log('📋 Available tables:', tables.map(t => t.table_name));
    
    // 2. Check users table
    if (tables.some(t => t.table_name === 'users')) {
      const userCount = await sql`SELECT COUNT(*) as count FROM users`;
      console.log(`👥 Users in database: ${userCount[0].count}`);
      
      if (userCount[0].count > 0) {
        const sampleUsers = await sql`
          SELECT id, email, name, role, email_verified 
          FROM users 
          LIMIT 3
        `;
        console.log('Sample users:', sampleUsers);
      }
    }
    
    // 3. Check barbers table
    if (tables.some(t => t.table_name === 'barbers')) {
      const barberCount = await sql`SELECT COUNT(*) as count FROM barbers`;
      console.log(`💼 Barbers in database: ${barberCount[0].count}`);
      
      if (barberCount[0].count > 0) {
        const barbers = await sql`
          SELECT id, name, specialties, is_active 
          FROM barbers 
          WHERE is_active = true
        `;
        console.log('Active barbers:', barbers);
      }
    }
    
    // 4. Check services table
    if (tables.some(t => t.table_name === 'services')) {
      const serviceCount = await sql`SELECT COUNT(*) as count FROM services`;
      console.log(`⚙️ Services in database: ${serviceCount[0].count}`);
      
      if (serviceCount[0].count > 0) {
        const services = await sql`
          SELECT id, name, price, duration, is_active 
          FROM services 
          WHERE is_active = true
          LIMIT 5
        `;
        console.log('Active services:', services);
      }
    }
    
    // 5. Check bookings table structure
    if (tables.some(t => t.table_name === 'bookings')) {
      console.log('\n📅 Checking bookings table structure...');
      const columns = await sql`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        ORDER BY ordinal_position
      `;
      
      console.log('Bookings table columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
      
      const bookingCount = await sql`SELECT COUNT(*) as count FROM bookings`;
      console.log(`\n📊 Bookings in database: ${bookingCount[0].count}`);
      
      if (bookingCount[0].count > 0) {
        const recentBookings = await sql`
          SELECT id, customer_name, date, time, status, barber_name, service
          FROM bookings 
          ORDER BY created_at DESC 
          LIMIT 3
        `;
        console.log('Recent bookings:', recentBookings);
      }
    }
    
    // 6. Test data integrity
    console.log('\n🔍 Testing data integrity...');
    
    // Check if we have the required data for booking
    const integrityChecks = await Promise.all([
      sql`SELECT COUNT(*) as count FROM barbers WHERE is_active = true`,
      sql`SELECT COUNT(*) as count FROM services WHERE is_active = true`,
    ]);
    
    console.log(`✅ Active barbers: ${integrityChecks[0][0].count}`);
    console.log(`✅ Active services: ${integrityChecks[1][0].count}`);
    
    if (integrityChecks[0][0].count === 0) {
      console.log('⚠️ No active barbers found - this will cause booking issues');
    }
    
    if (integrityChecks[1][0].count === 0) {
      console.log('⚠️ No active services found - this will cause booking issues');
    }
    
    console.log('\n✅ Database structure check complete!');
    
  } catch (error) {
    console.error('💥 Database test failed:', error);
  }
}

testDatabaseStructure().catch(console.error);
