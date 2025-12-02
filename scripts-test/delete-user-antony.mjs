import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function deleteUserAntony() {
    const userEmail = 'antony.ciak2002@gmail.com';
    
    console.log(`\n🔍 Cerco utente con email: ${userEmail}...`);
    
    try {
        // 1. Verifica se l'utente esiste
        const users = await sql`
            SELECT * FROM users WHERE email = ${userEmail}
        `;
        
        if (users.length === 0) {
            console.log('❌ Utente non trovato nel database');
            return;
        }
        
        const user = users[0];
        console.log('\n✅ Utente trovato:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Nome: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Creato: ${user.created_at}`);
        
        // 2. Verifica prenotazioni associate
        const bookings = await sql`
            SELECT * FROM bookings WHERE user_id = ${user.id}
        `;
        
        console.log(`\n📅 Prenotazioni trovate: ${bookings.length}`);
        if (bookings.length > 0) {
            console.log('   Dettagli prenotazioni:');
            bookings.forEach(booking => {
                console.log(`   - ID: ${booking.id} | Data: ${booking.date} ${booking.time} | Barbiere: ${booking.barber_name} | Stato: ${booking.status}`);
            });
        }
        
        // 3. Elimina prenotazioni associate
        if (bookings.length > 0) {
            console.log('\n🗑️  Eliminazione prenotazioni...');
            const deletedBookings = await sql`
                DELETE FROM bookings WHERE user_id = ${user.id}
            `;
            console.log(`✅ ${bookings.length} prenotazioni eliminate`);
        }
        
        // 4. Elimina account NextAuth (se presente)
        console.log('\n🗑️  Eliminazione dati NextAuth...');
        
        const accountsDeleted = await sql`
            DELETE FROM accounts WHERE "userId" = ${user.id}
        `;
        console.log(`✅ Account OAuth eliminati`);
        
        const sessionsDeleted = await sql`
            DELETE FROM sessions WHERE "userId" = ${user.id}
        `;
        console.log(`✅ Sessioni eliminate`);
        
        // 5. Elimina l'utente
        console.log('\n🗑️  Eliminazione utente...');
        const deletedUser = await sql`
            DELETE FROM users WHERE id = ${user.id}
        `;
        
        console.log('\n✅ UTENTE ELIMINATO CON SUCCESSO');
        console.log(`   Email: ${userEmail}`);
        console.log(`   Prenotazioni rimosse: ${bookings.length}`);
        console.log(`   Data eliminazione: ${new Date().toISOString()}`);
        
    } catch (error) {
        console.error('\n❌ ERRORE durante eliminazione:', error);
        throw error;
    }
}

// Esegui script
deleteUserAntony()
    .then(() => {
        console.log('\n✅ Script completato');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script fallito:', error);
        process.exit(1);
    });
