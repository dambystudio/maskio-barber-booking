const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function updateMarcoRole() {
  try {
    console.log('🔍 Verifica barbiere Marco nel database...');
    
    // Prima verifica lo stato attuale
    const marco = await sql`
      SELECT name, email, phone, role, specialties 
      FROM barbers 
      WHERE name = 'Marco'
    `;
    
    if (marco.length > 0) {
      console.log('📋 Marco trovato - stato attuale:', JSON.stringify(marco[0], null, 2));
      
      // Aggiorna il ruolo da "Apprendista" a "Collaboratore"
      console.log('🔄 Aggiornamento ruolo da "Apprendista" a "Collaboratore"...');
      
      const updated = await sql`
        UPDATE barbers 
        SET role = 'Collaboratore'
        WHERE name = 'Marco' AND role = 'Apprendista'
      `;
      
      console.log(`✅ Aggiornamento completato. Righe modificate: ${updated.count}`);
      
      // Verifica finale
      const marcoUpdated = await sql`
        SELECT name, email, phone, role, specialties 
        FROM barbers 
        WHERE name = 'Marco'
      `;
      
      console.log('📋 Marco dopo aggiornamento:', JSON.stringify(marcoUpdated[0], null, 2));
      
    } else {
      console.log('❌ Marco non trovato nel database');
    }
    
    await sql.end();
    console.log('🏁 Operazione completata con successo');
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
}

updateMarcoRole();
