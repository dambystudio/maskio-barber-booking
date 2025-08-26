import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function testBarberMultipleBookings() {
    console.log('🧪 Test: Verifica che i barbieri possano fare prenotazioni multiple...');
    
    try {
        // 1. Verifica le prenotazioni attuali di Fabio per oggi
        const fabioBookingsToday = await sql`
            SELECT * FROM bookings 
            WHERE barber_id = 'fabio' 
            AND date = '2025-08-26'
            ORDER BY time
        `;
        
        console.log(`\n📊 Fabio ha ${fabioBookingsToday.length} prenotazioni per oggi (26 agosto):`);
        
        if (fabioBookingsToday.length > 0) {
            fabioBookingsToday.forEach(booking => {
                console.log(`   ⏰ ${booking.time} - ${booking.customer_name} (${booking.service})`);
                console.log(`      📧 user_id: ${booking.user_id || 'null (CORRETTO per barbieri)'}`);
            });
        } else {
            console.log('   ❌ Nessuna prenotazione trovata per oggi');
        }
        
        // 2. Simula il test: verifica che il problema sia risolto
        console.log(`\n🔍 Analisi del problema risolto:`);
        
        // Cerca prenotazioni di barbieri che hanno user_id non null
        const barberBookingsWithUserId = await sql`
            SELECT DISTINCT barber_id, barber_name, COUNT(*) as count
            FROM bookings 
            WHERE barber_id IN ('fabio', 'michele', 'marco')
            AND user_id IS NOT NULL
            GROUP BY barber_id, barber_name
        `;
        
        if (barberBookingsWithUserId.length > 0) {
            console.log('⚠️ Prenotazioni con user_id ancora presenti (da correggere):');
            barberBookingsWithUserId.forEach(barber => {
                console.log(`   ${barber.barber_name}: ${barber.count} prenotazioni con user_id`);
            });
        } else {
            console.log('✅ Tutte le prenotazioni dei barbieri hanno user_id = null');
        }
        
        // 3. Verifica la struttura corretta
        console.log(`\n📋 Struttura corretta per le prenotazioni:`);
        console.log('✅ CLIENTE normale: user_id = ID del cliente');
        console.log('✅ BARBIERE per cliente: user_id = null');
        console.log('✅ ADMIN per cliente: user_id = null');
        
        // 4. Test API endpoint (simulato)
        console.log(`\n🌐 Test logica API (simulato):`);
        
        const testRoles = [
            { role: 'customer', description: 'Cliente normale' },
            { role: 'barber', description: 'Barbiere (Fabio/Michele/Marco)' },
            { role: 'admin', description: 'Admin (Davide)' }
        ];
        
        testRoles.forEach(test => {
            const canBookMultiple = test.role === 'barber' || test.role === 'admin';
            const userIdAssociation = test.role === 'customer' ? 'user.id' : 'null';
            
            console.log(`   👤 ${test.description}:`);
            console.log(`      📅 Può fare più prenotazioni stesso giorno: ${canBookMultiple ? '✅ SÌ' : '❌ NO'}`);
            console.log(`      🔗 user_id nella prenotazione: ${userIdAssociation}`);
        });
        
        // 5. Suggerimenti per il test manuale
        console.log(`\n🧪 Per testare manualmente:`);
        console.log('1. Accedi come Fabio (fabio.cassano97@icloud.com)');
        console.log('2. Fai una prenotazione per un cliente oggi');
        console.log('3. Prova a farne una seconda per un altro cliente oggi');
        console.log('4. ✅ Non dovrebbe più dare "Hai già una prenotazione per questo giorno"');
        console.log('5. ✅ Dovrebbe permettere prenotazioni in orari diversi');
        console.log('6. ❌ Dovrebbe ancora bloccare prenotazioni nello stesso orario');
        
    } catch (error) {
        console.error('❌ Errore nel test:', error);
    }
}

testBarberMultipleBookings();
