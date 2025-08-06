const { neon } = require('@neondatabase/serverless');
require('dotenv/config');

const sql = neon(process.env.DATABASE_URL);

async function updateMarcoRole() {
  try {
    console.log('🔍 Verifica barbiere Marco nel database...');
    
    // Prima verifica lo stato attuale
    const marco = await sql`
      SELECT name, email, phone, experience, specialties 
      FROM barbers 
      WHERE name = 'Marco'
    `;
    
    if (marco.length > 0) {
      console.log('📋 Marco trovato - stato attuale:', JSON.stringify(marco[0], null, 2));
      
      // Aggiorna il ruolo da "Apprendista" a "Collaboratore"
      console.log('🔄 Aggiornamento experience da "Apprendista barbiere in formazione..." a "Collaboratore"...');
      
      const updated = await sql`
        UPDATE barbers 
        SET experience = 'Collaboratore'
        WHERE name = 'Marco'
      `;
      
      console.log(`✅ Aggiornamento completato. Righe modificate: ${updated.count}`);
      
      // Verifica finale
      const marcoUpdated = await sql`
        SELECT name, email, phone, experience, specialties 
        FROM barbers 
        WHERE name = 'Marco'
      `;
      
      console.log('📋 Marco dopo aggiornamento:', JSON.stringify(marcoUpdated[0], null, 2));
      
    } else {
      console.log('❌ Marco non trovato nel database');
    }
    
    console.log('🏁 Operazione completata con successo');
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
}

updateMarcoRole();
