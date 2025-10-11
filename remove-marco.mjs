import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function removeMarco() {
  console.log('🗑️ Rimozione di Marco dal database...\n');

  try {
    // 1. Trova l'ID di Marco
    console.log('🔍 Cercando Marco nel database...');
    const marcos = await sql`
      SELECT id, name, email 
      FROM barbers 
      WHERE email = 'marcocis2006@gmail.com' OR name ILIKE '%marco%'
    `;

    if (marcos.length === 0) {
      console.log('✅ Marco non trovato nel database. Niente da rimuovere.');
      return;
    }

    console.log(`📊 Trovati ${marcos.length} record per Marco:`);
    marcos.forEach((marco, index) => {
      console.log(`   ${index + 1}. ID: "${marco.id}" - Nome: "${marco.name}" - Email: "${marco.email}"`);
    });

    // 2. Per ogni Marco trovato, rimuovi i dati associati
    for (const marco of marcos) {
      console.log(`\n🧹 Rimozione dati per Marco (ID: ${marco.id})...`);

      // Conta prenotazioni di Marco
      const bookingsCount = await sql`
        SELECT COUNT(*) as count 
        FROM bookings 
        WHERE barber_id = ${marco.id}
      `;
      console.log(`   📅 Prenotazioni trovate: ${bookingsCount[0].count}`);

      // Rimuovi le prenotazioni di Marco
      if (parseInt(bookingsCount[0].count) > 0) {
        await sql`
          DELETE FROM bookings 
          WHERE barber_id = ${marco.id}
        `;
        console.log(`   ✅ Rimosse ${bookingsCount[0].count} prenotazioni`);
      }

      // Conta schedules di Marco
      const schedulesCount = await sql`
        SELECT COUNT(*) as count 
        FROM barber_schedules 
        WHERE barber_id = ${marco.id}
      `;
      console.log(`   📆 Schedules trovati: ${schedulesCount[0].count}`);

      // Rimuovi gli schedules di Marco
      if (parseInt(schedulesCount[0].count) > 0) {
        await sql`
          DELETE FROM barber_schedules 
          WHERE barber_id = ${marco.id}
        `;
        console.log(`   ✅ Rimossi ${schedulesCount[0].count} schedules`);
      }

      // Rimuovi Marco dalla tabella barbers
      await sql`
        DELETE FROM barbers 
        WHERE id = ${marco.id}
      `;
      console.log(`   ✅ Rimosso barbiere Marco (ID: ${marco.id}) dalla tabella barbers`);
    }

    // 3. Verifica che non ci siano user con l'email di Marco con ruolo barber
    console.log('\n🔍 Verifica utenti con email di Marco...');
    const marcoUsers = await sql`
      SELECT id, email, name, role 
      FROM users 
      WHERE email = 'marcocis2006@gmail.com'
    `;

    if (marcoUsers.length > 0) {
      console.log(`📊 Trovati ${marcoUsers.length} utenti con email di Marco:`);
      marcoUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ID: "${user.id}" - Email: "${user.email}" - Nome: "${user.name}" - Ruolo: "${user.role}"`);
      });

      // Chiedi conferma prima di rimuovere gli utenti
      console.log('\n⚠️  Rimozione utenti associati...');
      
      for (const user of marcoUsers) {
        await sql`DELETE FROM users WHERE id = ${user.id}`;
        console.log(`   ✅ Rimosso utente ${user.email}`);
      }
    } else {
      console.log('✅ Nessun utente trovato con email di Marco');
    }

    console.log('\n✅ Rimozione di Marco completata con successo!');
    console.log('📝 Ricorda di riavviare l\'applicazione per applicare le modifiche.');

  } catch (error) {
    console.error('❌ Errore durante la rimozione di Marco:', error);
    throw error;
  }
}

// Esegui lo script
removeMarco()
  .then(() => {
    console.log('\n🎉 Script completato!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script fallito:', error);
    process.exit(1);
  });
