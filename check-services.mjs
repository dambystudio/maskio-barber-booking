import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkServices() {
  try {
    console.log('🔍 Checking services in database...');
    
    const services = await sql`SELECT * FROM services ORDER BY name`;
    
    console.log('📋 Available services:');
    services.forEach(service => {
      console.log(`  - ID: ${service.id}`);
      console.log(`    Name: ${service.name}`);
      console.log(`    Price: €${service.price}`);
      console.log(`    Duration: ${service.duration} min`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error checking services:', error);
  }
}

checkServices();
