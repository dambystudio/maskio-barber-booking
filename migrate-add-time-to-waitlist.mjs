import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Carica variabili d'ambiente
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

console.log('\n🔧 MIGRAZIONE: Aggiungi colonna "time" alla tabella waitlist\n');
console.log('━'.repeat(80));

async function migrate() {
  try {
    console.log('📋 Step 1: Verifico se la colonna "time" esiste già...');
    
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'waitlist' 
        AND column_name = 'time'
    `;

    if (checkColumn.length > 0) {
      console.log('✅ La colonna "time" esiste già! Nessuna migrazione necessaria.');
      process.exit(0);
    }

    console.log('⚠️  La colonna "time" non esiste. Procedo con la migrazione...\n');

    console.log('📋 Step 2: Aggiungo colonna "time" (permettendo NULL temporaneamente)...');
    await sql`
      ALTER TABLE waitlist 
      ADD COLUMN time VARCHAR(5)
    `;
    console.log('✅ Colonna aggiunta con successo!');

    console.log('\n📋 Step 3: Popolo la colonna "time" con i dati esistenti da "offered_time"...');
    const updated = await sql`
      UPDATE waitlist 
      SET time = COALESCE(offered_time, '10:00')
      WHERE time IS NULL
    `;
    console.log(`✅ Aggiornate ${updated.length} righe`);

    console.log('\n📋 Step 4: Imposto la colonna "time" come NOT NULL...');
    await sql`
      ALTER TABLE waitlist 
      ALTER COLUMN time SET NOT NULL
    `;
    console.log('✅ Vincolo NOT NULL aggiunto!');

    console.log('\n' + '━'.repeat(80));
    console.log('✅ MIGRAZIONE COMPLETATA CON SUCCESSO!');
    console.log('━'.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ ERRORE DURANTE LA MIGRAZIONE:', error);
    console.error('   Dettagli:', error.message);
    process.exit(1);
  }
}

migrate();
