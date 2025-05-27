import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkBarbers() {
  try {
    console.log('🔍 Checking barbers in database...');
    
    const barbers = await sql`SELECT * FROM barbers ORDER BY name`;
    
    console.log('👨‍💼 Available barbers:');
    barbers.forEach(barber => {
      console.log(`  - ID: ${barber.id}`);
      console.log(`    Name: ${barber.name}`);
      console.log(`    Active: ${barber.isactive}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error checking barbers:', error);
  }
}

checkBarbers();
