import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkClosureTypes() {
  console.log('🔍 Analizzando i tipi di chiusura esistenti...\n');

  try {
    // Ottieni tutti i record per vedere i valori di closure_type
    const allClosures = await sql`
      SELECT barber_email, closure_date, closure_type, reason 
      FROM barber_closures 
      ORDER BY closure_date
    `;

    console.log(`📊 Totale chiusure: ${allClosures.length}`);
    console.log('\n📋 Dettagli chiusure:');
    allClosures.forEach((closure, index) => {
      console.log(`   ${index + 1}. ${closure.closure_date} - Tipo: "${closure.closure_type}" - ${closure.reason}`);
    });

    // Ottieni i valori unici di closure_type
    const uniqueTypes = [...new Set(allClosures.map(c => c.closure_type))];
    console.log('\n🏷️ Tipi di chiusura unici trovati:');
    uniqueTypes.forEach((type, index) => {
      console.log(`   ${index + 1}. "${type}"`);
    });

    // Controlla i constraint della tabella
    console.log('\n🔍 Controllo constraint della tabella...');
    const constraints = await sql`
      SELECT constraint_name, check_clause
      FROM information_schema.check_constraints 
      WHERE constraint_name LIKE '%closure_type%'
    `;

    console.log('🏗️ Constraint trovati:');
    constraints.forEach(constraint => {
      console.log(`   - ${constraint.constraint_name}: ${constraint.check_clause}`);
    });

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

checkClosureTypes();
