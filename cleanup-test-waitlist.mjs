import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

await sql`DELETE FROM waitlist WHERE customer_email = 'test@example.com'`;
console.log('✅ Cleanup completato');
