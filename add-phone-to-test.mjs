import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function addPhoneToTestEntry() {
  console.log('📱 Adding phone number to test waitlist entry...\n');

  try {
    // Trova l'entry di test
    const testEntry = await sql`
      SELECT id, customer_name, customer_email 
      FROM waitlist 
      WHERE customer_email = 'prova@gmail.com'
      AND status = 'waiting'
    `;

    if (testEntry.length === 0) {
      console.log('❌ No test entry found with prova@gmail.com');
      return;
    }

    // Aggiungi numero di telefono
    const phoneNumber = '+39 123 456 7890';
    await sql`
      UPDATE waitlist 
      SET customer_phone = ${phoneNumber}
      WHERE id = ${testEntry[0].id}
    `;

    console.log(`✅ Added phone number ${phoneNumber} to ${testEntry[0].customer_name}`);
    
    // Verifica l'aggiornamento
    const updated = await sql`
      SELECT customer_name, customer_email, customer_phone
      FROM waitlist 
      WHERE id = ${testEntry[0].id}
    `;

    console.log('📋 Updated entry:', updated[0]);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addPhoneToTestEntry();
