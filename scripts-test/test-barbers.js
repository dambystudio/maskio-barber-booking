const { neon } = require('@neondatabase/serverless');

async function getBarbers() {
  const sql = neon('postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require');
  const barbers = await sql`SELECT id, name FROM barbers`;
  console.log('Barbers:', JSON.stringify(barbers, null, 2));
}

getBarbers().catch(console.error);
