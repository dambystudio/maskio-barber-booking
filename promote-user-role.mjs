// Script per promuovere un utente ad admin
import { db } from './src/lib/database-postgres.js';
import { users } from './src/lib/schema.js';
import { eq } from 'drizzle-orm';

async function promoteUserToAdmin() {
  const email = process.argv[2];
  const targetRole = process.argv[3] || 'admin'; // admin, barber, o user
  
  if (!email) {
    console.log('❌ Errore: Specificare l\'email dell\'utente');
    console.log('📖 Uso: node promote-user-role.mjs <email> [admin|barber|user]');
    console.log('📖 Esempio: node promote-user-role.mjs fabio.cassano97@icloud.com admin');
    process.exit(1);
  }

  if (!['admin', 'barber', 'user'].includes(targetRole)) {
    console.log('❌ Errore: Ruolo non valido. Usare: admin, barber, o user');
    process.exit(1);
  }

  try {
    console.log(`🔄 Cercando utente con email: ${email}`);
    
    // Cerca l'utente
    const userList = await db.select().from(users).where(eq(users.email, email));
    
    if (userList.length === 0) {
      console.log(`❌ Nessun utente trovato con email: ${email}`);
      process.exit(1);
    }

    const user = userList[0];
    console.log(`✅ Utente trovato: ${user.name} (ID: ${user.id})`);
    console.log(`📋 Ruolo attuale: ${user.role || 'user'}`);

    // Aggiorna il ruolo
    const result = await db
      .update(users)
      .set({ 
        role: targetRole,
        updatedAt: new Date()
      })
      .where(eq(users.email, email))
      .returning();

    if (result.length > 0) {
      console.log(`🎉 SUCCESSO! Utente promosso a: ${targetRole}`);
      console.log(`👤 Nome: ${result[0].name}`);
      console.log(`📧 Email: ${result[0].email}`);
      console.log(`🏷️ Nuovo ruolo: ${result[0].role}`);
    } else {
      console.log('❌ Errore nell\'aggiornamento del ruolo');
    }

  } catch (error) {
    console.error('❌ Errore durante la promozione:', error);
    process.exit(1);
  }
}

// Esegui solo se chiamato direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  promoteUserToAdmin();
}
