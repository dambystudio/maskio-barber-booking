import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function debugMicheleOct30() {
    console.log('\n🔍 DEBUG MICHELE 30 OTTOBRE 2025');
    console.log('='.repeat(80));
    
    try {
        const date = '2025-10-30';
        const micheleEmail = 'michelebiancofiore0230@gmail.com';
        
        // Get Michele's ID
        const michele = await sql`SELECT id, name FROM barbers WHERE email = ${micheleEmail}`;
        if (michele.length === 0) {
            throw new Error('Michele not found!');
        }
        const micheleId = michele[0].id;
        
        console.log(`\n📅 Data: ${date} (Giovedì)`);
        console.log(`👤 Barbiere: ${michele[0].name} (${micheleId})\n`);
        
        // 1. Check schedule
        console.log('='.repeat(80));
        console.log('📋 SCHEDULE DATABASE:');
        console.log('='.repeat(80));
        
        const schedule = await sql`
            SELECT * FROM barber_schedules 
            WHERE barber_id = ${micheleId} AND date = ${date}
        `;
        
        if (schedule.length === 0) {
            console.log('❌ NESSUN SCHEDULE TROVATO!\n');
        } else {
            const s = schedule[0];
            const availableSlots = JSON.parse(s.available_slots || '[]');
            const unavailableSlots = JSON.parse(s.unavailable_slots || '[]');
            
            console.log(`✅ Schedule trovato:`);
            console.log(`   ID: ${s.id}`);
            console.log(`   day_off: ${s.day_off} ${s.day_off ? '❌ CHIUSO' : '✅ APERTO'}`);
            console.log(`   available_slots: ${availableSlots.length} slot`);
            console.log(`   unavailable_slots: ${unavailableSlots.length} slot`);
            console.log(`   created_at: ${s.created_at}`);
            console.log(`   updated_at: ${s.updated_at}`);
            
            if (availableSlots.length > 0) {
                console.log(`\n   ✅ Slot disponibili (${availableSlots.length}):`);
                console.log(`      ${availableSlots.join(', ')}`);
            }
        }
        
        // 2. Check recurring closures
        console.log('\n' + '='.repeat(80));
        console.log('🔄 CHIUSURE RICORRENTI:');
        console.log('='.repeat(80));
        
        const recurringClosures = await sql`
            SELECT * FROM barber_recurring_closures 
            WHERE barber_email = ${micheleEmail}
        `;
        
        if (recurringClosures.length > 0) {
            const closedDays = JSON.parse(recurringClosures[0].closed_days || '[]');
            console.log(`✅ Trovate chiusure ricorrenti:`);
            console.log(`   Giorni chiusi: ${closedDays.join(', ')}`);
            console.log(`   (0=Domenica, 1=Lunedì, ..., 4=Giovedì, ..., 6=Sabato)`);
            
            const thursday = 4;
            if (closedDays.includes(thursday)) {
                console.log(`\n   ⚠️ GIOVEDÌ (4) è in chiusure ricorrenti!`);
                console.log(`   Questo significa che normalmente Michele è chiuso il giovedì.`);
            } else {
                console.log(`\n   ✅ Giovedì NON è in chiusure ricorrenti.`);
            }
        } else {
            console.log('✅ Nessuna chiusura ricorrente trovata');
        }
        
        // 3. Check bookings
        console.log('\n' + '='.repeat(80));
        console.log('📋 PRENOTAZIONI:');
        console.log('='.repeat(80));
        
        const bookings = await sql`
            SELECT time, status, customer_name FROM bookings 
            WHERE barber_id = ${micheleId} AND date = ${date}
            ORDER BY time
        `;
        
        console.log(`Totale prenotazioni: ${bookings.length}`);
        if (bookings.length > 0) {
            bookings.forEach(b => {
                console.log(`   - ${b.time}: ${b.customer_name} (${b.status})`);
            });
        }
        
        // 4. Test batch-availability API
        console.log('\n' + '='.repeat(80));
        console.log('🌐 TEST API BATCH-AVAILABILITY:');
        console.log('='.repeat(80));
        
        const apiResponse = await fetch('https://www.maskiobarberconcept.it/api/bookings/batch-availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                barberId: micheleId,
                dates: [date]
            })
        });
        
        const apiData = await apiResponse.json();
        const dayData = apiData.availability[date];
        
        console.log(`\nRisposta API:`);
        console.log(`   hasSlots: ${dayData.hasSlots} ${dayData.hasSlots ? '✅' : '❌'}`);
        console.log(`   availableCount: ${dayData.availableCount}`);
        console.log(`   totalSlots: ${dayData.totalSlots}`);
        
        // 5. Diagnosi
        console.log('\n' + '='.repeat(80));
        console.log('🎯 DIAGNOSI:');
        console.log('='.repeat(80));
        
        if (schedule.length === 0) {
            console.log('\n❌ PROBLEMA 1: Schedule non esiste nel database!');
            console.log('   SOLUZIONE: Creare schedule con day_off=false');
        } else if (schedule[0].day_off === true) {
            console.log('\n❌ PROBLEMA 1: day_off è TRUE nel database!');
            console.log('   SOLUZIONE: Impostare day_off=false per apertura eccezionale');
        } else {
            console.log('\n✅ Database OK: day_off=false');
        }
        
        if (!dayData.hasSlots && schedule.length > 0 && !schedule[0].day_off) {
            console.log('\n❌ PROBLEMA 2: API dice hasSlots=false ma database è corretto!');
            console.log('   POSSIBILE CAUSA: Bug nell\'API batch-availability');
            console.log('   VERIFICA: Controlla se l\'API sta controllando le chiusure ricorrenti');
        }
        
        if (dayData.hasSlots && dayData.availableCount > 0) {
            console.log('\n✅ TUTTO OK! L\'API ritorna slot disponibili.');
        }
        
    } catch (error) {
        console.error('❌ ERRORE:', error);
        throw error;
    }
}

debugMicheleOct30()
    .then(() => {
        console.log('\n✅ Debug completato\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Debug fallito:', error);
        process.exit(1);
    });
