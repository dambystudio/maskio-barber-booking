import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require');

async function checkBarberData() {
  try {
    console.log('🔍 Checking current barbers table structure and data...');

    // Check table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'barbers'
      ORDER BY ordinal_position
    `;

    console.log('\n📋 Current barbers table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check actual data
    const barbers = await sql`SELECT * FROM barbers`;
    console.log(`\n👥 Number of barbers: ${barbers.length}`);

    if (barbers.length > 0) {
      console.log('\n📊 Current barber data:');
      barbers.forEach(barber => {
        console.log(`  - ID: ${barber.id}`);
        console.log(`    Name: ${barber.name}`);
        console.log(`    Email: ${barber.email || 'NULL'}`);
        console.log(`    Phone: ${barber.phone || 'NULL'}`);
        console.log(`    Experience: ${barber.experience || 'NULL'}`);
        console.log(`    Specialties: ${barber.specialties || 'NULL'}`);
        console.log(`    User ID: ${barber.user_id || 'NULL'}`);
        console.log(`    Active: ${barber.is_active}`);
        console.log(`    Created: ${barber.created_at}`);
        console.log('    ---');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkBarberData();
