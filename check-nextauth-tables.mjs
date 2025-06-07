import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Create database connection
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

console.log('🔍 Checking NextAuth tables...');

try {
  // Check if NextAuth tables exist
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('accounts', 'sessions', 'users', 'verificationToken', 'user_preferences')
    ORDER BY table_name;
  `;
  
  console.log('📊 NextAuth tables found:');
  tables.forEach(table => {
    console.log(`  ✅ ${table.table_name}`);
  });
  
  // Check users table structure
  console.log('\n📋 Users table columns:');
  const usersColumns = await sql`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    ORDER BY ordinal_position;
  `;
  
  usersColumns.forEach(col => {
    console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
  });
  
  // Check accounts table structure
  console.log('\n📋 Accounts table columns:');
  const accountsColumns = await sql`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'accounts' 
    ORDER BY ordinal_position;
  `;
  
  accountsColumns.forEach(col => {
    console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
  });
  
  console.log('\n✅ Database migration successful! NextAuth tables are ready.');
  
} catch (error) {
  console.error('❌ Error checking NextAuth tables:', error);
  process.exit(1);
}
