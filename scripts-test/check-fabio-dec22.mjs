#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function checkFabioMonday() {
  // Verifica chiusure ricorrenti
  const recurring = await sql`
    SELECT closed_days FROM barber_recurring_closures
    WHERE barber_email = 'fabio.cassano97@icloud.com'
  `;
  
  console.log('Fabio chiusure ricorrenti:', recurring[0]?.closed_days);
  
  // Il 22 dicembre 2025 è lunedì (day=1)
  // Dovrebbe esserci una chiusura 'full' automatica
  
  const closures = await sql`
    SELECT * FROM barber_closures
    WHERE barber_email = 'fabio.cassano97@icloud.com'
    AND closure_date = '2025-12-22'
  `;
  
  console.log('\nChiusure 22 dicembre:', closures);
  
  // Creo la chiusura se non c'è
  if (closures.length === 0) {
    console.log('\n❌ Manca chiusura full per Fabio il 22 dicembre!');
    console.log('Creo chiusura automatica...\n');
    
    await sql`
      INSERT INTO barber_closures (barber_email, closure_date, closure_type, reason, created_by)
      VALUES ('fabio.cassano97@icloud.com', '2025-12-22', 'full', 'Chiusura automatica - Riposo settimanale', 'system-auto')
    `;
    
    console.log('✅ Chiusura creata!');
  }
}

checkFabioMonday();
