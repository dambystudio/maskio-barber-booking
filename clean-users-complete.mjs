import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function cleanAllUsers() {
  try {
    console.log('🔍 Controllo utenti esistenti...');
    
    // Prima controlliamo se ci sono utenti
    const users = await sql`SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC`;
    
    console.log(`📊 Trovati ${users.length} utenti nel database:`);
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Creato: ${user.created_at}`);
        console.log('---');
      });
      
      console.log('🗑️ Eliminando tutti gli utenti...');
      
      // Elimina prima i record dipendenti
      console.log('🗑️ Eliminando bookings associati...');
      await sql`DELETE FROM bookings WHERE user_id IS NOT NULL`;
      
      console.log('🗑️ Eliminando user_preferences...');
      await sql`DELETE FROM user_preferences`;
      
      console.log('🗑️ Eliminando accounts NextAuth...');
      await sql`DELETE FROM accounts`;
      
      console.log('🗑️ Eliminando sessions NextAuth...');
      await sql`DELETE FROM sessions`;
      
      console.log('🗑️ Eliminando verification_tokens...');
      await sql`DELETE FROM "verificationToken"`;
      
      // Ora elimina gli utenti
      console.log('🗑️ Eliminando tutti gli utenti...');
      const deletedUsers = await sql`DELETE FROM users RETURNING id, email`;
      
      console.log(`✅ Eliminati ${deletedUsers.length} utenti con successo!`);
      deletedUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.id})`);
      });
    } else {
      console.log('✅ Database già pulito - nessun utente presente');
    }
    
    // Verifica finale
    const finalCheck = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`\n🔍 Verifica finale: ${finalCheck[0].count} utenti rimasti`);
    
    if (finalCheck[0].count === 0) {
      console.log('✅ SUCCESSO: Database completamente pulito!');
    } else {
      console.log('⚠️ ATTENZIONE: Alcuni utenti sono ancora presenti');
    }
    
  } catch (error) {
    console.error('❌ Errore durante la pulizia:', error);
  }
}

cleanAllUsers();
