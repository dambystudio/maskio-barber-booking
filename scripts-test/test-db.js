const { neon } = require('@neondatabase/serverless');

async function testConnection() {
  try {
    console.log('🔗 Testing database connection...');
    
    const sql = neon('postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require');
    
    // Test basic query
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connected successfully!');
    console.log('📅 Current database time:', result[0].current_time);
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('📊 Available tables:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testConnection();
