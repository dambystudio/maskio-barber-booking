import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function checkBarberPhones() {
  try {
    const barbers = await sql`SELECT id, name, email, phone FROM barbers`;
    console.log('📞 Barbieri nel database:');
    barbers.forEach(b => {
      console.log(`- ${b.name} (${b.id}): ${b.phone || 'TELEFONO MANCANTE'}`);
    });
  } catch (error) {
    console.error('Errore:', error.message);
  }
}

checkBarberPhones();
