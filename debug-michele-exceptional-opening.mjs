import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function debugExceptionalOpening() {
    console.log('\n🔍 DEBUG APERTURA ECCEZIONALE MICHELE');
    console.log('='.repeat(80));
    
    const testDate = '2025-10-30';
    const micheleEmail = 'michelebiancofiore0230@gmail.com';
    
    try {
        // 1. Get Michele
        const michele = await sql`
            SELECT id, name, email FROM barbers WHERE email = ${micheleEmail}
        `;
        
        if (michele.length === 0) {
            console.log('❌ Michele non trovato');
            return;
        }
        
        const barberId = michele[0].id;
        console.log(`✅ Barbiere: ${michele[0].name} (ID: ${barberId})`);
        
        // 2. Check schedule for October 30
        console.log(`\n📅 SCHEDULE PER ${testDate}:`);
        const schedule = await sql`
            SELECT * FROM barber_schedules 
            WHERE barber_id = ${barberId} AND date = ${testDate}
        `;
        
        if (schedule.length > 0) {
            const s = schedule[0];
            const slots = JSON.parse(s.available_slots);
            console.log(`   ✅ Schedule trovato`);
            console.log(`   - ID: ${s.id}`);
            console.log(`   - day_off: ${s.day_off}`);
            console.log(`   - available_slots: ${slots.length} slot`);
            console.log(`   - Slot: ${slots.join(', ')}`);
            console.log(`   - created_at: ${s.created_at}`);
            console.log(`   - updated_at: ${s.updated_at}`);
            
            if (s.day_off === false && slots.length > 0) {
                console.log(`\n   ✅ CONFIGURAZIONE CORRETTA per apertura eccezionale`);
            } else {
                console.log(`\n   ❌ PROBLEMA:`);
                if (s.day_off === true) {
                    console.log(`      - day_off è TRUE (dovrebbe essere FALSE)`);
                }
                if (slots.length === 0) {
                    console.log(`      - Nessuno slot disponibile`);
                }
            }
        } else {
            console.log(`   ❌ NESSUNO SCHEDULE TROVATO per ${testDate}`);
            console.log(`   ⚠️ L'apertura eccezionale NON è stata creata!`);
        }
        
        // 3. Check recurring closures
        console.log('\n🔄 CHIUSURE RICORRENTI:');
        const recurring = await sql`
            SELECT * FROM barber_recurring_closures 
            WHERE barber_email = ${micheleEmail}
        `;
        
        if (recurring.length > 0) {
            const closedDays = JSON.parse(recurring[0].closed_days);
            console.log(`   Closed days: ${closedDays.join(', ')}`);
            console.log(`   Include giovedì (4): ${closedDays.includes(4) ? 'SÌ' : 'NO'}`);
        }
        
        // 4. Check specific closures
        console.log('\n🚫 CHIUSURE SPECIFICHE:');
        const closures = await sql`
            SELECT * FROM barber_closures 
            WHERE barber_email = ${micheleEmail} AND closure_date = ${testDate}
        `;
        
        if (closures.length > 0) {
            console.log(`   ⚠️ TROVATE ${closures.length} chiusure specifiche per ${testDate}:`);
            closures.forEach(c => {
                console.log(`   - Tipo: ${c.closure_type}, Motivo: ${c.reason || 'N/A'}`);
            });
            console.log(`\n   ❌ PROBLEMA: Chiusure specifiche SOVRASCRIVONO aperture eccezionali!`);
        } else {
            console.log(`   ✅ Nessuna chiusura specifica`);
        }
        
        // 5. Test API simulation
        console.log('\n🌐 SIMULAZIONE RISPOSTA API:');
        if (schedule.length > 0 && !schedule[0].day_off) {
            const slots = JSON.parse(schedule[0].available_slots);
            const bookedSlots = await sql`
                SELECT time FROM bookings 
                WHERE barber_id = ${barberId} 
                AND date = ${testDate}
                AND status != 'cancelled'
            `;
            
            const bookedTimes = bookedSlots.map(b => b.time);
            const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));
            
            console.log(`   Total slots: ${slots.length}`);
            console.log(`   Booked: ${bookedTimes.length}`);
            console.log(`   Available: ${availableSlots.length}`);
            console.log(`   API hasSlots: ${availableSlots.length > 0 ? 'TRUE ✅' : 'FALSE ❌'}`);
        } else {
            console.log(`   ❌ Schedule non trovato o day_off=true`);
        }
        
        // 6. Summary
        console.log('\n' + '='.repeat(80));
        console.log('📊 DIAGNOSI:');
        console.log('='.repeat(80));
        
        const hasSchedule = schedule.length > 0;
        const dayOffFalse = hasSchedule && schedule[0].day_off === false;
        const hasSlots = hasSchedule && JSON.parse(schedule[0].available_slots).length > 0;
        const hasSpecificClosure = closures.length > 0;
        
        if (!hasSchedule) {
            console.log('\n❌ PROBLEMA: Nessuno schedule trovato per 30 ottobre');
            console.log('\n💡 SOLUZIONE:');
            console.log('   1. Vai al pannello prenotazioni');
            console.log('   2. Sezione "Aperture Eccezionali"');
            console.log('   3. Seleziona data: 30/10/2025');
            console.log('   4. Seleziona barbiere: Michele');
            console.log('   5. Click "Aggiungi Apertura"');
        } else if (!dayOffFalse) {
            console.log('\n❌ PROBLEMA: day_off è TRUE invece di FALSE');
            console.log('\n💡 SOLUZIONE: Esegui fix-michele-october-30-dayoff.mjs');
        } else if (!hasSlots) {
            console.log('\n❌ PROBLEMA: Nessuno slot in available_slots');
            console.log('\n💡 SOLUZIONE: Ricrea apertura eccezionale con slot corretti');
        } else if (hasSpecificClosure) {
            console.log('\n❌ PROBLEMA: Chiusura specifica attiva per 30 ottobre');
            console.log('\n💡 SOLUZIONE: Elimina la chiusura specifica dal pannello');
        } else {
            console.log('\n✅ DATABASE CONFIGURATO CORRETTAMENTE');
            console.log('\n⚠️ Se Michele risulta ancora chiuso, il problema è:');
            console.log('   1. Cache del browser (premi Ctrl+Shift+R)');
            console.log('   2. Frontend non aggiorna exceptionalOpenings');
            console.log('   3. Server non riavviato dopo modifiche');
        }
        
    } catch (error) {
        console.error('\n❌ ERRORE:', error);
        throw error;
    }
}

debugExceptionalOpening()
    .then(() => {
        console.log('\n✅ Debug completato\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Debug fallito:', error);
        process.exit(1);
    });
