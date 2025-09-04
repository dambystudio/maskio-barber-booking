import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function setFabioMondayClosures() {
  console.log('🗓️ Impostazione chiusure Fabio per tutti i lunedì dal 22 settembre a dicembre...\n');

  try {
    // Definiamo le date dei lunedì dal 22 settembre al 30 dicembre 2025
    const mondayDates = [
      '2025-09-22', '2025-09-29',
      '2025-10-06', '2025-10-13', '2025-10-20', '2025-10-27',
      '2025-11-03', '2025-11-10', '2025-11-17', '2025-11-24',
      '2025-12-01', '2025-12-08', '2025-12-15', '2025-12-22', '2025-12-29'
    ];

    console.log(`📅 Date da impostare (${mondayDates.length} lunedì):`);
    mondayDates.forEach((date, index) => {
      console.log(`   ${index + 1}. ${date}`);
    });

    console.log('\n🔍 Verifico chiusure esistenti per Fabio...');
    
    // Controlla chiusure esistenti per Fabio
    const existingClosures = await sql`
      SELECT closure_date, closure_type, reason 
      FROM barber_closures 
      WHERE barber_email = 'fabio.cassano97@icloud.com'
      AND closure_date = ANY(${mondayDates})
      ORDER BY closure_date
    `;

    console.log(`   Trovate ${existingClosures.length} chiusure esistenti per le date specificate`);
    if (existingClosures.length > 0) {
      existingClosures.forEach(closure => {
        console.log(`   - ${closure.closure_date}: ${closure.closure_type} (${closure.reason})`);
      });
    }

    // Per ogni lunedì, aggiungi o aggiorna la chiusura per tutto il giorno
    console.log('\n🔧 Impostazione chiusure per tutto il giorno...');
    
    let addedCount = 0;
    let updatedCount = 0;
    
    for (const date of mondayDates) {
      // Controlla se esiste già una chiusura per questa data
      const existingClosure = await sql`
        SELECT id, closure_type 
        FROM barber_closures 
        WHERE barber_email = 'fabio.cassano97@icloud.com'
        AND closure_date = ${date}
      `;

      if (existingClosure.length > 0) {
        // Aggiorna la chiusura esistente a "full"
        await sql`
          UPDATE barber_closures 
          SET closure_type = 'full',
              reason = 'Chiusura completa lunedì per Fabio Cassano',
              updated_at = NOW()
          WHERE id = ${existingClosure[0].id}
        `;
        console.log(`   ✅ Aggiornata: ${date} → chiusura completa`);
        updatedCount++;
      } else {
        // Crea una nuova chiusura
        await sql`
          INSERT INTO barber_closures (
            barber_email, 
            closure_date, 
            closure_type, 
            reason, 
            created_by
          ) VALUES (
            'fabio.cassano97@icloud.com',
            ${date},
            'full',
            'Chiusura completa lunedì per Fabio Cassano',
            'admin'
          )
        `;
        console.log(`   ✅ Aggiunta: ${date} → chiusura completa`);
        addedCount++;
      }
    }

    console.log(`\n📊 Risultati:`);
    console.log(`   ➕ Chiusure aggiunte: ${addedCount}`);
    console.log(`   🔄 Chiusure aggiornate: ${updatedCount}`);
    console.log(`   📅 Totale lunedì coperti: ${mondayDates.length}`);

    // Verifica finale
    console.log('\n🔍 Verifica finale delle chiusure...');
    const finalClosures = await sql`
      SELECT closure_date, closure_type, reason 
      FROM barber_closures 
      WHERE barber_email = 'fabio.cassano97@icloud.com'
      AND closure_date >= '2025-09-22'
      AND closure_date <= '2025-12-31'
      ORDER BY closure_date
    `;

    console.log(`   Totale chiusure per Fabio (settembre-dicembre): ${finalClosures.length}`);
    finalClosures.forEach(closure => {
      const dayOfWeek = new Date(closure.closure_date + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'long' });
      console.log(`   - ${closure.closure_date} (${dayOfWeek}): ${closure.closure_type}`);
    });

    console.log(`\n✅ Chiusure per Fabio impostate con successo!`);
    console.log(`🗓️ Fabio sarà chiuso tutti i lunedì dal 22 settembre al 29 dicembre 2025`);

  } catch (error) {
    console.error('❌ Errore durante l\'impostazione delle chiusure:', error);
  }
}

setFabioMondayClosures();
