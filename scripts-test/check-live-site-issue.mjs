import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkLiveIssue() {
    console.log('\n🔍 VERIFICA PROBLEMA SITO LIVE');
    console.log('='.repeat(80));
    
    const testDate = '2025-10-30';
    const micheleEmail = 'michelebiancofiore0230@gmail.com';
    
    try {
        // 1. Get Michele
        const michele = await sql`
            SELECT id FROM barbers WHERE email = ${micheleEmail}
        `;
        
        const barberId = michele[0].id;
        
        // 2. CRITICAL: Check if there's a SPECIFIC CLOSURE for Oct 30
        console.log('\n🚨 CONTROLLO CRITICO: Chiusure Specifiche');
        const specificClosures = await sql`
            SELECT * FROM barber_closures 
            WHERE barber_email = ${micheleEmail} 
            AND closure_date = ${testDate}
        `;
        
        if (specificClosures.length > 0) {
            console.log('❌ TROVATO IL PROBLEMA!');
            console.log(`   Ci sono ${specificClosures.length} chiusure specifiche per ${testDate}:`);
            specificClosures.forEach(closure => {
                console.log(`   - ID: ${closure.id}`);
                console.log(`   - Tipo: ${closure.closure_type}`);
                console.log(`   - Motivo: ${closure.reason || 'N/A'}`);
                console.log(`   - All day: ${closure.all_day}`);
                console.log('');
            });
            
            console.log('\n💡 SOLUZIONE:');
            console.log('   Le CHIUSURE SPECIFICHE hanno priorità sulle APERTURE ECCEZIONALI!');
            console.log('   Devi ELIMINARE la chiusura specifica prima.');
            console.log('\n   Opzione 1: Dal pannello prenotazioni → Chiusure → Elimina 30 ottobre');
            console.log('   Opzione 2: Esegui script di pulizia (lo creo ora)');
            
            return { hasSpecificClosure: true, closures: specificClosures };
        } else {
            console.log('✅ Nessuna chiusura specifica trovata');
        }
        
        // 3. Check schedule
        console.log('\n📅 Schedule 30 Ottobre:');
        const schedule = await sql`
            SELECT * FROM barber_schedules 
            WHERE barber_id = ${barberId} AND date = ${testDate}
        `;
        
        if (schedule.length === 0) {
            console.log('❌ TROVATO IL PROBLEMA!');
            console.log('   Nessuno schedule trovato per 30 ottobre');
            console.log('\n💡 SOLUZIONE:');
            console.log('   L\'apertura eccezionale NON è stata creata!');
            console.log('   1. Vai al pannello: https://maskio-barber.vercel.app/pannello-prenotazioni');
            console.log('   2. Scroll fino a "🔓 Aperture Eccezionali"');
            console.log('   3. Seleziona data: 30/10/2025');
            console.log('   4. Seleziona barbiere: Michele');
            console.log('   5. Click "Aggiungi Apertura"');
            
            return { hasSchedule: false };
        }
        
        const s = schedule[0];
        console.log(`   day_off: ${s.day_off}`);
        console.log(`   available_slots: ${JSON.parse(s.available_slots).length} slot`);
        
        if (s.day_off === true) {
            console.log('\n❌ TROVATO IL PROBLEMA!');
            console.log('   day_off è TRUE invece di FALSE');
            console.log('\n💡 SOLUZIONE: Eseguo fix automatico...');
            
            // Auto-fix
            await sql`
                UPDATE barber_schedules 
                SET day_off = false, updated_at = NOW()
                WHERE barber_id = ${barberId} AND date = ${testDate}
            `;
            
            console.log('   ✅ FIXED! day_off ora è FALSE');
        }
        
        // 4. Check API response simulation
        console.log('\n🌐 Simulazione Risposta API:');
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
        console.log(`   Available: ${availableSlots.length}`);
        console.log(`   hasSlots: ${availableSlots.length > 0 ? '✅ TRUE' : '❌ FALSE'}`);
        
        // 5. Final check
        console.log('\n' + '='.repeat(80));
        console.log('📊 STATO FINALE:');
        
        const recurring = await sql`
            SELECT closed_days FROM barber_recurring_closures 
            WHERE barber_email = ${micheleEmail}
        `;
        
        const closedDays = JSON.parse(recurring[0].closed_days);
        const dayOfWeek = new Date(testDate).getDay();
        const isRecurringClosed = closedDays.includes(dayOfWeek);
        
        console.log(`   - Schedule esistente: ✅`);
        console.log(`   - day_off: ${s.day_off ? '❌ true' : '✅ false'}`);
        console.log(`   - Slot disponibili: ${availableSlots.length}`);
        console.log(`   - Chiusura ricorrente giovedì: ${isRecurringClosed ? '✅ SÌ' : 'NO'}`);
        console.log(`   - Chiusure specifiche: ${specificClosures.length > 0 ? '❌ SÌ' : '✅ NO'}`);
        
        const shouldWork = 
            schedule.length > 0 && 
            s.day_off === false && 
            availableSlots.length > 0 && 
            isRecurringClosed &&
            specificClosures.length === 0;
        
        console.log('\n' + '='.repeat(80));
        if (shouldWork) {
            console.log('✅ TUTTO CONFIGURATO CORRETTAMENTE!');
            console.log('\n🔄 PROVA QUESTO:');
            console.log('   1. Vai al sito: https://maskio-barber.vercel.app/prenota');
            console.log('   2. Premi Ctrl+Shift+R per hard refresh');
            console.log('   3. Apri DevTools (F12) → Console');
            console.log('   4. Seleziona Michele');
            console.log('   5. Cerca log: "🔓 2025-10-30: EXCEPTIONAL OPENING"');
            console.log('\n   Se NON vedi questo log, il problema è nel frontend.');
        } else {
            console.log('❌ PROBLEMI RILEVATI - Vedi sopra per soluzioni');
        }
        
    } catch (error) {
        console.error('\n❌ ERRORE:', error);
        throw error;
    }
}

checkLiveIssue()
    .then(() => {
        console.log('\n✅ Verifica completata\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Verifica fallita:', error);
        process.exit(1);
    });
