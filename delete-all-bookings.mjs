// Script per eliminare tutte le prenotazioni dal database
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function deleteAllBookings() {
    console.log('🗑️ Eliminazione di tutte le prenotazioni...\n');
    
    try {
        // Prima conta le prenotazioni esistenti
        const countResult = await sql`SELECT COUNT(*) as count FROM bookings`;
        const totalBookings = countResult[0].count;
        
        console.log(`📊 Prenotazioni trovate: ${totalBookings}`);
        
        if (totalBookings === 0) {
            console.log('✅ Il database è già vuoto - nessuna prenotazione da eliminare!');
            return;
        }
        
        // Conferma eliminazione
        console.log(`⚠️ Stai per eliminare ${totalBookings} prenotazioni.`);
        console.log('🔄 Procedendo con l\'eliminazione...\n');
        
        // Elimina tutte le prenotazioni
        const deleteResult = await sql`DELETE FROM bookings`;
        
        console.log(`✅ Eliminate ${deleteResult.count || totalBookings} prenotazioni con successo!`);
        
        // Verifica che il database sia vuoto
        const verifyResult = await sql`SELECT COUNT(*) as count FROM bookings`;
        const remainingBookings = verifyResult[0].count;
        
        if (remainingBookings === 0) {
            console.log('🎉 Database completamente pulito!');
        } else {
            console.log(`⚠️ Attenzione: rimangono ancora ${remainingBookings} prenotazioni`);
        }
        
    } catch (error) {
        console.error('❌ Errore durante l\'eliminazione delle prenotazioni:', error);
        
        if (error.code === '42P01') {
            console.log('💡 La tabella "bookings" non esiste ancora nel database.');
        }
    }
}

// Esegui la pulizia
deleteAllBookings()
    .then(() => {
        console.log('\n🏁 Operazione completata.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Errore fatale:', error);
        process.exit(1);
    });
