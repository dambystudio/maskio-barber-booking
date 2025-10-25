import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function debugFabioDecember22() {
    const testDate = '2025-12-22'; // Lunedì 22 dicembre 2025
    const fabioEmail = 'fabio.cassano97@icloud.com';
    
    console.log('\n🔍 DEBUG FABIO - LUNEDÌ 22 DICEMBRE 2025');
    console.log('='.repeat(80));
    
    try {
        // Get Fabio's ID
        const fabio = await sql`SELECT id, name FROM barbers WHERE email = ${fabioEmail}`;
        
        if (fabio.length === 0) {
            console.log('❌ Fabio non trovato!');
            return;
        }
        
        const barberId = fabio[0].id;
        const barberName = fabio[0].name;
        
        console.log(`\n👨‍💼 Barbiere: ${barberName} (${barberId})`);
        console.log(`📅 Data: ${testDate}`);
        console.log(`📆 Giorno: Lunedì`);
        
        // Check schedule
        console.log('\n📋 SCHEDULE:');
        const schedule = await sql`
            SELECT * FROM barber_schedules 
            WHERE barber_id = ${barberId} AND date = ${testDate}
        `;
        
        if (schedule.length === 0) {
            console.log('   ❌ Nessuno schedule trovato');
            console.log('   💡 Fabio è chiuso il lunedì per policy aziendale');
        } else {
            const availableSlots = JSON.parse(schedule[0].available_slots || '[]');
            const unavailableSlots = JSON.parse(schedule[0].unavailable_slots || '[]');
            
            console.log(`   day_off: ${schedule[0].day_off}`);
            console.log(`   available_slots: ${availableSlots.length} slot`);
            console.log(`   unavailable_slots: ${unavailableSlots.length} slot`);
            
            if (schedule[0].day_off) {
                console.log('   ⚠️ day_off = TRUE → Fabio è configurato come chiuso');
            }
            
            if (availableSlots.length > 0) {
                console.log(`   Slot disponibili: ${availableSlots.join(', ')}`);
            }
        }
        
        // Check recurring closures
        console.log('\n🔄 CHIUSURE RICORRENTI:');
        const recurringClosures = await sql`
            SELECT * FROM barber_recurring_closures 
            WHERE barber_email = ${fabioEmail}
        `;
        
        if (recurringClosures.length > 0) {
            const closedDays = JSON.parse(recurringClosures[0].closed_days);
            console.log(`   Giorni chiusi: ${closedDays.join(', ')}`);
            
            // Monday = 1
            if (closedDays.includes(1)) {
                console.log('   ✅ Lunedì (1) è nella lista dei giorni chiusi');
            } else {
                console.log('   ❌ Lunedì (1) NON è nella lista dei giorni chiusi');
            }
        } else {
            console.log('   ℹ️ Nessuna chiusura ricorrente configurata');
        }
        
        // Check bookings
        console.log('\n📅 PRENOTAZIONI:');
        const bookings = await sql`
            SELECT * FROM bookings 
            WHERE barber_id = ${barberId} AND date = ${testDate}
            ORDER BY time
        `;
        
        console.log(`   Totale: ${bookings.length} prenotazioni`);
        
        if (bookings.length > 0) {
            bookings.forEach(b => {
                console.log(`   - ${b.time}: ${b.status} - ${b.customer_name} (${b.customer_email})`);
            });
        }
        
        // Check waitlist
        console.log('\n⏰ LISTA D\'ATTESA:');
        const waitlist = await sql`
            SELECT * FROM waitlist 
            WHERE barber_id = ${barberId} AND date = ${testDate}
            ORDER BY created_at
        `;
        
        console.log(`   Totale: ${waitlist.length} richieste in lista d'attesa`);
        
        if (waitlist.length > 0) {
            console.log('\n   📋 Dettagli lista d\'attesa:');
            waitlist.forEach((w, index) => {
                console.log(`   ${index + 1}. ${w.customer_name} (${w.customer_email})`);
                console.log(`      Status: ${w.status}`);
                console.log(`      Creata: ${w.created_at}`);
                console.log(`      Notificata: ${w.notified ? 'Sì' : 'No'}`);
            });
        }
        
        // Diagnosis
        console.log('\n' + '='.repeat(80));
        console.log('🎯 DIAGNOSI:');
        console.log('='.repeat(80));
        
        if (recurringClosures.length > 0) {
            const closedDays = JSON.parse(recurringClosures[0].closed_days);
            if (closedDays.includes(1)) {
                console.log('✅ Fabio è configurato come CHIUSO il lunedì (chiusura ricorrente)');
                console.log('   → Questo è corretto secondo la policy aziendale');
            }
        }
        
        if (waitlist.length > 0) {
            console.log(`\n⚠️ CI SONO ${waitlist.length} RICHIESTE IN LISTA D'ATTESA!`);
            console.log('   → Questo NON dovrebbe succedere per un giorno chiuso');
            console.log('   → Possibili cause:');
            console.log('     1. Frontend non controlla correttamente le chiusure');
            console.log('     2. Prenotazioni fatte prima che la chiusura venisse configurata');
            console.log('     3. Bug nel sistema di lista d\'attesa');
        }
        
    } catch (error) {
        console.error('❌ ERRORE:', error);
        throw error;
    }
}

debugFabioDecember22()
    .then(() => {
        console.log('\n✅ Debug completato\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Debug fallito:', error);
        process.exit(1);
    });
