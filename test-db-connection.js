import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testDatabaseConnection() {
  console.log('🔗 Testing PostgreSQL connection...');
  
  try {
    const sql = neon(process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require');
    
    // Test connection
    const result = await sql`SELECT NOW() as current_time, version() as db_version`;
    console.log('✅ Database connected successfully!');
    console.log('⏰ Current time:', result[0].current_time);
    console.log('📊 Database version:', result[0].db_version.split(' ')[0]);
    
    // Check tables
    const tables = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position
    `;
    
    console.log('📋 Database schema:');
    const tableData = {};
    tables.forEach(row => {
      if (!tableData[row.table_name]) {
        tableData[row.table_name] = [];
      }
      tableData[row.table_name].push(`${row.column_name} (${row.data_type})`);
    });
    
    Object.keys(tableData).forEach(tableName => {
      console.log(`  📄 ${tableName}:`);
      tableData[tableName].forEach(column => {
        console.log(`    - ${column}`);
      });
    });
    
    // Test data
    const bookingCount = await sql`SELECT COUNT(*) as count FROM bookings`;
    const barberCount = await sql`SELECT COUNT(*) as count FROM barbers`;
    const serviceCount = await sql`SELECT COUNT(*) as count FROM services`;
    
    console.log('📊 Data summary:');
    console.log(`  🗓️  Bookings: ${bookingCount[0].count}`);
    console.log(`  👨‍💼 Barbers: ${barberCount[0].count}`);
    console.log(`  💼 Services: ${serviceCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testDatabaseConnection();
