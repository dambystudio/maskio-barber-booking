import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

const result = await sql`
  UPDATE waitlist 
  SET status = 'waiting',
      offered_time = NULL,
      offer_expires_at = NULL,
      updated_at = NOW()
  WHERE user_id = (SELECT id FROM users WHERE email = 'test@gmail.com')
    AND barber_id = 'michele'
    AND date = '2025-12-05'
`;

console.log('✅ Waitlist resettata a "waiting"');
console.log(`   Record aggiornati: ${result.count || 1}\n`);

// Verifica
const [entry] = await sql`
  SELECT status, position, offered_time FROM waitlist
  WHERE user_id = (SELECT id FROM users WHERE email = 'test@gmail.com')
    AND barber_id = 'michele'
    AND date = '2025-12-05'
`;

console.log('📋 Situazione attuale:');
console.log(`   Status: ${entry.status}`);
console.log(`   Posizione: ${entry.position}`);
console.log(`   Offerta: ${entry.offered_time || 'Nessuna'}\n`);
