import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkScheduleStructure() {
  console.log('🔍 Controllo struttura tabella barber_schedules...\n');

  try {
    // Controlla la struttura della tabella
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'barber_schedules'
      ORDER BY ordinal_position
    `;

    console.log('📋 Struttura tabella barber_schedules:');
    tableInfo.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    // Mostra alcuni record di esempio
    console.log('\n📊 Record di esempio dalla tabella:');
    const sampleRecords = await sql`
      SELECT * FROM barber_schedules 
      LIMIT 5
    `;

    if (sampleRecords.length === 0) {
      console.log('   ❌ Nessun record trovato nella tabella barber_schedules');
    } else {
      sampleRecords.forEach((record, index) => {
        console.log(`   ${index + 1}. Record:`, JSON.stringify(record, null, 2));
      });
    }

    // Verifica il barbiere Marco
    console.log('\n👤 Controllo barbiere Marco:');
    const marco = await sql`
      SELECT id, name, email FROM barbers WHERE name = 'Marco'
    `;

    if (marco.length === 0) {
      console.log('   ❌ Marco non trovato');
    } else {
      console.log(`   ✅ Marco trovato: ID ${marco[0].id}, Email: ${marco[0].email}`);
      
      // Cerca schedule per Marco
      const marcoSchedules = await sql`
        SELECT * FROM barber_schedules 
        WHERE barber_id = ${marco[0].id}
        LIMIT 10
      `;
      
      console.log(`\n📅 Schedule di Marco (primi 10):`);
      if (marcoSchedules.length === 0) {
        console.log('   ❌ Nessun schedule trovato per Marco');
      } else {
        marcoSchedules.forEach((schedule, index) => {
          console.log(`   ${index + 1}.`, JSON.stringify(schedule, null, 2));
        });
      }
    }

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

checkScheduleStructure();
