// Script completo per eliminare tutte le prenotazioni e dati correlati
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function cleanDatabase() {
    console.log('🧹 Pulizia completa del database - Eliminazione prenotazioni...\n');
    
    try {
        // Verifica esistenza tabelle
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('bookings', 'booking_items', 'booking_services')
        `;
        
        console.log('📋 Tabelle trovate:', tables.map(t => t.table_name).join(', '));
        
        // Conta prenotazioni esistenti
        let totalBookings = 0;
        if (tables.some(t => t.table_name === 'bookings')) {
            const countResult = await sql`SELECT COUNT(*) as count FROM bookings`;
            totalBookings = countResult[0].count;
            console.log(`📊 Prenotazioni esistenti: ${totalBookings}`);
        }
        
        if (totalBookings === 0) {
            console.log('✅ Il database è già pulito - nessuna prenotazione trovata!');
            return;
        }
        
        console.log('🔄 Procedendo con la pulizia...\n');
        
        // Elimina in ordine (rispettando i foreign keys)
        let deletedCount = 0;
        
        // 1. Elimina booking_services se esiste
        if (tables.some(t => t.table_name === 'booking_services')) {
            const result1 = await sql`DELETE FROM booking_services`;
            console.log(`📦 Eliminati servizi delle prenotazioni: ${result1.count || 0}`);
        }
        
        // 2. Elimina booking_items se esiste  
        if (tables.some(t => t.table_name === 'booking_items')) {
            const result2 = await sql`DELETE FROM booking_items`;
            console.log(`📦 Eliminati articoli delle prenotazioni: ${result2.count || 0}`);
        }
        
        // 3. Elimina le prenotazioni principali
        if (tables.some(t => t.table_name === 'bookings')) {
            const result3 = await sql`DELETE FROM bookings`;
            deletedCount = result3.count || totalBookings;
            console.log(`📅 Eliminate prenotazioni principali: ${deletedCount}`);
        }
        
        // 4. Reset delle sequenze ID (opzionale)
        try {
            if (tables.some(t => t.table_name === 'bookings')) {
                await sql`ALTER SEQUENCE bookings_id_seq RESTART WITH 1`;
                console.log('🔄 Sequenza bookings ID resettata');
            }
        } catch (seqError) {
            console.log('ℹ️ Sequenza bookings non resettata (normale se non esiste)');
        }
        
        // Verifica finale
        if (tables.some(t => t.table_name === 'bookings')) {
            const finalCount = await sql`SELECT COUNT(*) as count FROM bookings`;
            const remaining = finalCount[0].count;
            
            if (remaining === 0) {
                console.log('\n🎉 Database completamente pulito!');
                console.log(`✅ Totale prenotazioni eliminate: ${deletedCount}`);
            } else {
                console.log(`\n⚠️ Attenzione: rimangono ancora ${remaining} prenotazioni`);
            }
        }
        
    } catch (error) {
        console.error('❌ Errore durante la pulizia:', error);
        
        if (error.code === '42P01') {
            console.log('💡 Una o più tabelle di prenotazione non esistono ancora.');
        } else if (error.code === '23503') {
            console.log('💡 Errore di vincolo foreign key - alcune dipendenze potrebbero esistere ancora.');
        }
    }
}

// Esegui la pulizia
cleanDatabase()
    .then(() => {
        console.log('\n🏁 Pulizia database completata.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Errore fatale:', error);
        process.exit(1);
    });
