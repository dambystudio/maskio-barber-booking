import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function checkServices() {
  const services = await sql`
    SELECT id, name, price, duration, is_active FROM services
    ORDER BY price
  `;

  console.log('\n📋 TUTTI I SERVIZI:\n');
  services.forEach(s => {
    console.log(`ID: ${s.id}`);
    console.log(`  Nome: ${s.name}`);
    console.log(`  Prezzo: €${s.price}`);
    console.log(`  Durata: ${s.duration} min`);
    console.log(`  Attivo: ${s.is_active}`);
    console.log('');
  });
}

checkServices();
