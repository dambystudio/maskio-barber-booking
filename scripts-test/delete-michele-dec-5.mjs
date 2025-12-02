import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function deleteMicheleBookingsDec5() {
    const testDate = '2025-12-05';
    const micheleEmail = 'michelebiancofiore0230@gmail.com';
    
    console.log('\n🗑️ ELIMINA PRENOTAZIONI MICHELE - 5 DICEMBRE 2025');
    console.log('='.repeat(80));
    
    try {
        // Get Michele's ID
        const michele = await sql`SELECT id, name FROM barbers WHERE email = ${micheleEmail}`;
        
        if (michele.length === 0) {
            console.log('❌ Michele non trovato!');
            return;
        }
        
        const barberId = michele[0].id;
        const barberName = michele[0].name;
        
        console.log(`\n👨‍💼 Barbiere: ${barberName} (${barberId})`);
        console.log(`📅 Data: ${testDate}`);
        
        // Check existing bookings
        console.log('\n📋 PRENOTAZIONI ESISTENTI:');
        const existingBookings = await sql`
            SELECT * FROM bookings 
            WHERE barber_id = ${barberId} AND date = ${testDate}
            ORDER BY time
        `;
        
        console.log(`   Totale: ${existingBookings.length} prenotazioni`);
        
        if (existingBookings.length === 0) {
            console.log('   ✅ Nessuna prenotazione da eliminare');
            return;
        }
        
        console.log('\n   📋 Dettagli:');
        existingBookings.forEach((b, index) => {
            console.log(`   ${index + 1}. ${b.time} - ${b.customer_name} (${b.customer_email})`);
            console.log(`      Status: ${b.status}`);
            console.log(`      Servizi: ${b.services}`);
            console.log(`      ID: ${b.id}`);
        });
        
        // Confirm deletion
        console.log('\n⚠️ ATTENZIONE: Stai per eliminare TUTTE queste prenotazioni!');
        console.log('   Procedo con l\'eliminazione...\n');
        
        // Delete all bookings
        const result = await sql`
            DELETE FROM bookings 
            WHERE barber_id = ${barberId} AND date = ${testDate}
            RETURNING *
        `;
        
        console.log(`\n✅ ELIMINAZIONE COMPLETATA!`);
        console.log(`   Prenotazioni eliminate: ${result.length}`);
        
        if (result.length > 0) {
            console.log('\n   📋 Prenotazioni eliminate:');
            result.forEach((b, index) => {
                console.log(`   ${index + 1}. ${b.time} - ${b.customer_name}`);
            });
        }
        
        // Verify deletion
        console.log('\n🔍 VERIFICA:');
        const verifyBookings = await sql`
            SELECT COUNT(*) as count FROM bookings 
            WHERE barber_id = ${barberId} AND date = ${testDate}
        `;
        
        console.log(`   Prenotazioni rimanenti: ${verifyBookings[0].count}`);
        
        if (verifyBookings[0].count === 0) {
            console.log('   ✅ Tutte le prenotazioni sono state eliminate con successo!');
        } else {
            console.log('   ⚠️ Attenzione: ci sono ancora prenotazioni nel database');
        }
        
    } catch (error) {
        console.error('❌ ERRORE:', error);
        throw error;
    }
}

deleteMicheleBookingsDec5()
    .then(() => {
        console.log('\n✅ Operazione completata\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Operazione fallita:', error);
        process.exit(1);
    });
