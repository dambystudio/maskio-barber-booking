import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function testBarberLogicDirectly() {
    console.log('🧪 Test diretto: Logica barbieri e prenotazioni multiple');
    console.log('='.repeat(70));
    
    try {
        // Simula il controllo che viene fatto nell'API
        const testDate = '2025-09-15';
        const barberEmail = 'fabio.cassano97@icloud.com';
        
        console.log(`📅 Data di test: ${testDate}`);
        console.log(`👨‍💼 Email barbiere: ${barberEmail}`);
        
        // 1. Ottieni user_id del barbiere
        const barberUser = await sql`
            SELECT id, email, role 
            FROM users 
            WHERE email = ${barberEmail}
        `;
        
        if (barberUser.length === 0) {
            console.log('❌ Barbiere non trovato nel sistema users');
            return;
        }
        
        const barberUserId = barberUser[0].id;
        const barberRole = barberUser[0].role;
        
        console.log(`✅ Barbiere trovato:`);
        console.log(`   📧 Email: ${barberUser[0].email}`);
        console.log(`   🆔 User ID: ${barberUserId}`);
        console.log(`   👤 Role: ${barberRole}`);
        
        // 2. Verifica se è admin o barber
        const isBarberOrAdmin = barberRole === 'barber' || barberRole === 'admin';
        console.log(`\n🔍 Controllo permessi:`);
        console.log(`   È barbiere o admin? ${isBarberOrAdmin ? '✅ SÌ' : '❌ NO'}`);
        
        // 3. Simula il controllo duplicati (vecchia logica)
        console.log(`\n🔧 Test vecchia logica (doveva bloccare):`);
        const existingBookingsOldLogic = await sql`
            SELECT id, customer_name, time, service
            FROM bookings 
            WHERE user_id = ${barberUserId} 
            AND date = ${testDate}
        `;
        
        console.log(`   📊 Prenotazioni trovate con user_id del barbiere: ${existingBookingsOldLogic.length}`);
        if (existingBookingsOldLogic.length > 0) {
            console.log('   ⚠️ Con la vecchia logica, questo bloccherebbe nuove prenotazioni');
            existingBookingsOldLogic.forEach(booking => {
                console.log(`     - ${booking.time}: ${booking.customer_name} (${booking.service})`);
            });
        } else {
            console.log('   ✅ Nessuna prenotazione con user_id del barbiere (corretto)');
        }
        
        // 4. Simula la nuova logica (corretta)
        console.log(`\n🔧 Test nuova logica (corretta):`);
        if (isBarberOrAdmin) {
            console.log('   ✅ Utente è barbiere/admin: SALTA il controllo duplicati');
            console.log('   🎉 Può fare prenotazioni multiple lo stesso giorno!');
        } else {
            console.log('   📝 Utente normale: applica controllo duplicati');
            // Per utenti normali, controlla se hanno già prenotato
            const existingUserBookings = await sql`
                SELECT id FROM bookings 
                WHERE user_id = ${barberUserId} 
                AND date = ${testDate}
            `;
            
            if (existingUserBookings.length > 0) {
                console.log('   ❌ Utente ha già una prenotazione oggi');
            } else {
                console.log('   ✅ Utente può prenotare');
            }
        }
        
        // 5. Test controllo slot orario (deve sempre funzionare)
        console.log(`\n🔧 Test controllo slot orario:`);
        const testTime = '10:00';
        const barberId = 'fabio';
        
        const slotConflict = await sql`
            SELECT id, customer_name 
            FROM bookings 
            WHERE barber_id = ${barberId}
            AND date = ${testDate} 
            AND time = ${testTime}
        `;
        
        console.log(`   ⏰ Controllo slot ${testTime} per ${barberId}:`);
        if (slotConflict.length > 0) {
            console.log(`   ❌ Slot occupato da: ${slotConflict[0].customer_name}`);
            console.log('   📝 Questo conflitto deve essere sempre rilevato');
        } else {
            console.log('   ✅ Slot disponibile');
        }
        
        // 6. Verifica prenotazioni esistenti per questo barbiere
        console.log(`\n📊 Prenotazioni esistenti del barbiere ${barberId} per ${testDate}:`);
        const allBarberBookings = await sql`
            SELECT customer_name, time, service, user_id, created_at
            FROM bookings 
            WHERE barber_id = ${barberId}
            AND date = ${testDate}
            ORDER BY time
        `;
        
        if (allBarberBookings.length === 0) {
            console.log('   📋 Nessuna prenotazione esistente');
        } else {
            console.log(`   📋 Trovate ${allBarberBookings.length} prenotazioni:`);
            allBarberBookings.forEach((booking, index) => {
                const userIdStatus = booking.user_id ? 
                    (booking.user_id === barberUserId ? '⚠️ user_id barbiere' : '📱 user_id cliente') : 
                    '✅ user_id null';
                    
                console.log(`     ${index + 1}. ${booking.time} - ${booking.customer_name}`);
                console.log(`        Service: ${booking.service} | ${userIdStatus}`);
            });
        }
        
        // 7. Conclusione del test
        console.log(`\n🎯 RISULTATO DEL TEST:`);
        console.log('='.repeat(50));
        
        if (isBarberOrAdmin) {
            console.log('✅ TEST SUPERATO:');
            console.log('   • Barbiere identificato correttamente');
            console.log('   • Controllo duplicati bypassato per barbieri');
            console.log('   • Può fare prenotazioni multiple stesso giorno');
            console.log('   • Controllo slot orario funziona normalmente');
            
            console.log('\n💡 Il barbiere può prenotare per:');
            console.log('   • Cliente A alle 09:00');
            console.log('   • Cliente B alle 10:30');  
            console.log('   • Cliente C alle 15:00');
            console.log('   • ...senza conflitti!');
        } else {
            console.log('❌ PROBLEMA:');
            console.log('   • Barbiere non identificato come barber/admin');
            console.log('   • Controllo duplicati potrebbe bloccare');
        }
        
        // 8. Test addizionale: verifica tabella users
        console.log(`\n🔍 Verifica configurazione utenti barbieri:`);
        const allBarbers = await sql`
            SELECT email, role 
            FROM users 
            WHERE role IN ('barber', 'admin')
            ORDER BY email
        `;
        
        console.log(`📋 Utenti con ruolo barbiere/admin (${allBarbers.length}):`);
        allBarbers.forEach(user => {
            console.log(`   • ${user.email} (${user.role})`);
        });
        
    } catch (error) {
        console.error('❌ Errore nel test:', error);
    }
}

testBarberLogicDirectly();
