import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

// Simula le chiamate API per testare la funzionalità
const API_BASE = 'http://localhost:3000/api';

async function testBarberMultipleBookings() {
    console.log('🧪 Test: Barbiere può fare più prenotazioni lo stesso giorno');
    console.log('='.repeat(70));
    
    try {
        // Data di test
        const testDate = '2025-09-15';
        const barberId = 'fabio';
        
        console.log(`📅 Data di test: ${testDate}`);
        console.log(`👨‍💼 Barbiere di test: ${barberId.toUpperCase()}`);
        
        // Test 1: Prima prenotazione
        console.log('\n🔧 Test 1: Prima prenotazione del giorno...');
        const booking1 = {
            serviceIds: ['taglio'],
            barberId: barberId,
            date: testDate,
            time: '10:00',
            customerName: 'Mario Rossi Test',
            customerEmail: 'mario.test@example.com',
            customerPhone: '+39 333 111 0001',
            notes: 'Test prenotazione 1'
        };
        
        console.log(`   👤 Cliente: ${booking1.customerName}`);
        console.log(`   ⏰ Orario: ${booking1.time}`);
        
        try {
            const response1 = await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(booking1)
            });
            
            if (response1.ok) {
                const result1 = await response1.json();
                console.log('   ✅ Prima prenotazione creata con successo');
                console.log(`   📋 ID: ${result1.booking?.id || 'N/A'}`);
            } else {
                const error1 = await response1.text();
                console.log(`   ❌ Errore prima prenotazione: ${response1.status} - ${error1}`);
                return;
            }
        } catch (error) {
            console.log(`   ❌ Errore di rete prima prenotazione: ${error.message}`);
            return;
        }
        
        // Pausa di 1 secondo
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test 2: Seconda prenotazione stesso giorno
        console.log('\n🔧 Test 2: Seconda prenotazione stesso giorno...');
        const booking2 = {
            serviceIds: ['barba'],
            barberId: barberId,
            date: testDate,
            time: '15:30',
            customerName: 'Luigi Verdi Test',
            customerEmail: 'luigi.test@example.com',
            customerPhone: '+39 333 111 0002',
            notes: 'Test prenotazione 2 - stesso giorno'
        };
        
        console.log(`   👤 Cliente: ${booking2.customerName}`);
        console.log(`   ⏰ Orario: ${booking2.time}`);
        
        try {
            const response2 = await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(booking2)
            });
            
            if (response2.ok) {
                const result2 = await response2.json();
                console.log('   ✅ Seconda prenotazione creata con successo!');
                console.log(`   📋 ID: ${result2.booking?.id || 'N/A'}`);
                console.log('   🎉 TEST SUPERATO: Il barbiere può fare più prenotazioni!');
            } else {
                const error2 = await response2.text();
                console.log(`   ❌ Errore seconda prenotazione: ${response2.status} - ${error2}`);
                
                if (error2.includes('già fatto una prenotazione')) {
                    console.log('   🚨 PROBLEMA RILEVATO: Il controllo duplicati blocca ancora i barbieri!');
                }
            }
        } catch (error) {
            console.log(`   ❌ Errore di rete seconda prenotazione: ${error.message}`);
        }
        
        // Test 3: Terza prenotazione stesso giorno (per essere sicuri)
        console.log('\n🔧 Test 3: Terza prenotazione stesso giorno...');
        const booking3 = {
            serviceIds: ['taglio_barba'],
            barberId: barberId,
            date: testDate,
            time: '17:00',
            customerName: 'Francesco Neri Test',
            customerEmail: 'francesco.test@example.com',
            customerPhone: '+39 333 111 0003',
            notes: 'Test prenotazione 3 - terza dello stesso giorno'
        };
        
        console.log(`   👤 Cliente: ${booking3.customerName}`);
        console.log(`   ⏰ Orario: ${booking3.time}`);
        
        try {
            const response3 = await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(booking3)
            });
            
            if (response3.ok) {
                const result3 = await response3.json();
                console.log('   ✅ Terza prenotazione creata con successo!');
                console.log(`   📋 ID: ${result3.booking?.id || 'N/A'}`);
                console.log('   🎉 ECCELLENTE: Tre prenotazioni stesso giorno funzionano!');
            } else {
                const error3 = await response3.text();
                console.log(`   ❌ Errore terza prenotazione: ${response3.status} - ${error3}`);
            }
        } catch (error) {
            console.log(`   ❌ Errore di rete terza prenotazione: ${error.message}`);
        }
        
        // Verifica nel database
        console.log('\n📊 Verifica delle prenotazioni create nel database...');
        const createdBookings = await sql`
            SELECT id, customer_name, time, service, status, user_id
            FROM bookings 
            WHERE barber_id = ${barberId}
            AND date = ${testDate}
            AND customer_name LIKE '%Test%'
            ORDER BY time
        `;
        
        console.log(`✅ Trovate ${createdBookings.length} prenotazioni test nel database:`);
        createdBookings.forEach((booking, index) => {
            console.log(`   ${index + 1}. ${booking.time} - ${booking.customer_name} (${booking.service})`);
            console.log(`      user_id: ${booking.user_id || 'NULL'} (${booking.user_id ? '⚠️ Ha user_id' : '✅ Corretto'})`);
        });
        
        // Test del conflitto orario (deve fallire)
        console.log('\n🔧 Test 4: Conflitto orario (deve fallire)...');
        const bookingConflict = {
            serviceIds: ['taglio'],
            barberId: barberId,
            date: testDate,
            time: '10:00', // Stesso orario della prima prenotazione
            customerName: 'Antonio Bianchi Test',
            customerEmail: 'antonio.test@example.com',
            customerPhone: '+39 333 111 0004',
            notes: 'Test conflitto orario'
        };
        
        try {
            const responseConflict = await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingConflict)
            });
            
            if (responseConflict.ok) {
                console.log('   ❌ PROBLEMA: Il conflitto orario non è stato rilevato!');
            } else {
                const errorConflict = await responseConflict.text();
                console.log('   ✅ Conflitto orario correttamente rilevato');
                console.log(`   📝 Messaggio: ${errorConflict}`);
            }
        } catch (error) {
            console.log(`   ❌ Errore di rete test conflitto: ${error.message}`);
        }
        
        // Riepilogo finale
        console.log('\n🎯 RIEPILOGO DEL TEST:');
        console.log('=' .repeat(50));
        
        if (createdBookings.length >= 2) {
            console.log('✅ TEST SUPERATO: I barbieri possono fare prenotazioni multiple!');
            console.log(`   📊 Prenotazioni create: ${createdBookings.length}`);
            console.log('   🎉 La correzione funziona correttamente!');
        } else {
            console.log('❌ TEST FALLITO: Il problema persiste');
            console.log('   🔧 Potrebbe essere necessaria un\'ulteriore correzione');
        }
        
        // Pulizia (opzionale)
        console.log('\n🧹 Pulizia prenotazioni test...');
        const testIds = createdBookings.map(b => b.id);
        if (testIds.length > 0) {
            await sql`DELETE FROM bookings WHERE id = ANY(${testIds})`;
            console.log(`✅ Rimosse ${testIds.length} prenotazioni test`);
        }
        
    } catch (error) {
        console.error('❌ Errore generale nel test:', error);
    }
}

testBarberMultipleBookings();
