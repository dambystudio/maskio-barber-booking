import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkWaitlistTable() {
  try {
    console.log('🔍 STRUTTURA TABELLA WAITLIST\n');
    
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'waitlist'
      ORDER BY ordinal_position
    `;
    
    if (columns.length === 0) {
      console.log('❌ Tabella waitlist non trovata!\n');
      console.log('Creo la tabella...\n');
      
      await sql`
        CREATE TABLE IF NOT EXISTS waitlist (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          barber_id VARCHAR(255) NOT NULL,
          date DATE NOT NULL,
          user_name VARCHAR(255) NOT NULL,
          user_email VARCHAR(255) NOT NULL,
          user_phone VARCHAR(50),
          position INTEGER NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          notified_at TIMESTAMP,
          expires_at TIMESTAMP,
          booking_id UUID,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      
      console.log('✅ Tabella waitlist creata!\n');
      
      // Rileggi struttura
      const newColumns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'waitlist'
        ORDER BY ordinal_position
      `;
      
      console.log('Colonne create:');
      newColumns.forEach(c => {
        console.log(`  - ${c.column_name}: ${c.data_type} ${c.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
      
    } else {
      console.log('✅ Tabella waitlist trovata\n');
      console.log('Colonne:');
      columns.forEach(c => {
        console.log(`  - ${c.column_name}: ${c.data_type} ${c.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    }
    
    // Conta record
    const count = await sql`SELECT COUNT(*) as count FROM waitlist`;
    console.log(`\n📊 Record totali: ${count[0].count}`);
    
  } catch (error) {
    console.error('❌ Errore:', error);
    console.error(error.stack);
  }
}

checkWaitlistTable();
