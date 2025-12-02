import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function checkStructure() {
  try {
    console.log('🔍 STRUTTURA TABELLA barber_schedules\n');
    
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'barber_schedules'
      ORDER BY ordinal_position
    `;
    
    console.log('Colonne disponibili:');
    for (const col of columns) {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    }
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

checkStructure();
