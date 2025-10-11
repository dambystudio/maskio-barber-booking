import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkColumns() {
  const cols = await sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'waitlist' 
    AND column_name IN ('offered_time', 'offered_booking_id', 'offer_expires_at', 'offer_response')
  `;
  
  console.log('✅ Colonne trovate:', cols.length);
  cols.forEach(c => console.log('  -', c.column_name));
  
  if (cols.length < 4) {
    console.log('\n⚠️ Aggiungo colonne mancanti...');
    await sql`
      ALTER TABLE waitlist 
      ADD COLUMN IF NOT EXISTS offered_time VARCHAR(10),
      ADD COLUMN IF NOT EXISTS offered_booking_id UUID,
      ADD COLUMN IF NOT EXISTS offer_expires_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS offer_response VARCHAR(20)
    `;
    console.log('✅ Colonne aggiunte!');
  }
}

checkColumns();
