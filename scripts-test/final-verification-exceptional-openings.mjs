import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function finalVerification() {
    console.log('\n🔍 VERIFICA FINALE SISTEMA APERTURE ECCEZIONALI');
    console.log('='.repeat(80));
    
    const testDate = '2025-10-30';
    const micheleEmail = 'michelebiancofiore0230@gmail.com';
    
    try {
        // Get Michele
        const michele = await sql`
            SELECT id, name, email FROM barbers WHERE email = ${micheleEmail}
        `;
        
        if (michele.length === 0) {
            console.log('❌ Michele non trovato');
            return;
        }
        
        const barberId = michele[0].id;
        
        // 1. Check database schedule
        console.log('\n📅 DATABASE CHECK:');
        const schedule = await sql`
            SELECT * FROM barber_schedules 
            WHERE barber_id = ${barberId} AND date = ${testDate}
        `;
        
        if (schedule.length > 0) {
            const s = schedule[0];
            const slots = JSON.parse(s.available_slots);
            console.log(`   ✅ Schedule trovato per ${testDate}`);
            console.log(`   - day_off: ${s.day_off ? '❌ TRUE (CHIUSO)' : '✅ FALSE (APERTO)'}`);
            console.log(`   - Numero slot: ${slots.length}`);
            
            if (!s.day_off && slots.length > 0) {
                console.log(`   ✅ APERTURA ECCEZIONALE CONFERMATA`);
            } else {
                console.log(`   ❌ NON configurato come apertura eccezionale`);
                return;
            }
        } else {
            console.log(`   ❌ Nessuno schedule trovato per ${testDate}`);
            return;
        }
        
        // 2. Check recurring closure
        console.log('\n🔄 CHIUSURE RICORRENTI:');
        const recurring = await sql`
            SELECT * FROM barber_recurring_closures 
            WHERE barber_email = ${micheleEmail}
        `;
        
        if (recurring.length > 0) {
            const closedDays = JSON.parse(recurring[0].closed_days);
            const thursday = new Date(testDate).getDay(); // 4 = Thursday
            
            if (closedDays.includes(thursday)) {
                console.log(`   ✅ Giovedì (4) è in closedDays: ${closedDays}`);
                console.log(`   ✅ Questo conferma che 30/10 è un'ECCEZIONE alla regola`);
            } else {
                console.log(`   ⚠️ Giovedì NON è in closedDays`);
            }
        }
        
        // 3. Simulate API call
        console.log('\n🌐 SIMULAZIONE API /api/bookings/batch-availability:');
        
        // Get booked slots
        const bookedSlots = await sql`
            SELECT time FROM bookings 
            WHERE barber_id = ${barberId} 
            AND date = ${testDate}
            AND status != 'cancelled'
        `;
        
        const allSlots = JSON.parse(schedule[0].available_slots);
        const bookedTimes = bookedSlots.map(b => b.time);
        const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));
        
        console.log(`   - Total slots: ${allSlots.length}`);
        console.log(`   - Booked slots: ${bookedTimes.length}`);
        console.log(`   - Available slots: ${availableSlots.length}`);
        console.log(`   - hasSlots: ${availableSlots.length > 0 ? '✅ TRUE' : '❌ FALSE'}`);
        
        // 4. Frontend Logic Simulation
        console.log('\n🖥️ SIMULAZIONE LOGICA FRONTEND:');
        
        const hasSlots = availableSlots.length > 0;
        const dayOfWeek = new Date(testDate).getDay();
        const closedDays = recurring.length > 0 ? JSON.parse(recurring[0].closed_days) : [];
        const isRecurringClosed = closedDays.includes(dayOfWeek);
        
        console.log(`   Step 1: API ritorna hasSlots = ${hasSlots}`);
        console.log(`   Step 2: Check isRecurringClosed = ${isRecurringClosed}`);
        console.log(`   Step 3: hasSlots=${hasSlots} && isRecurringClosed=${isRecurringClosed}`);
        
        if (hasSlots && isRecurringClosed) {
            console.log(`   ✅ AGGIUNTO a exceptionalOpenings Set`);
            console.log(`   ✅ Bottone sarà ABILITATO`);
            console.log(`   ✅ Badge "Chiuso" sarà NASCOSTO`);
        } else {
            console.log(`   ❌ NON aggiunto a exceptionalOpenings`);
            if (!hasSlots) {
                console.log(`   ❌ Motivo: hasSlots=false`);
            }
            if (!isRecurringClosed) {
                console.log(`   ❌ Motivo: Non è normalmente chiuso`);
            }
        }
        
        // 5. Final Verdict
        console.log('\n' + '='.repeat(80));
        console.log('🎯 VERDETTO FINALE:');
        console.log('='.repeat(80));
        
        const allGood = 
            schedule.length > 0 && 
            !schedule[0].day_off && 
            allSlots.length > 0 && 
            hasSlots && 
            isRecurringClosed;
        
        if (allGood) {
            console.log('\n✅ TUTTO CONFIGURATO CORRETTAMENTE!');
            console.log('\n📋 Checklist Completata:');
            console.log('   ✅ Database: day_off=false');
            console.log('   ✅ Database: available_slots presente');
            console.log('   ✅ API: hasSlots=true');
            console.log('   ✅ Chiusura ricorrente: Giovedì in closed_days');
            console.log('   ✅ Frontend: Verrà aggiunto a exceptionalOpenings');
            console.log('   ✅ UI: Bottone sarà abilitato');
            console.log('\n🎉 Michele sarà visibile come DISPONIBILE il 30 ottobre!');
            console.log('\n📝 Prossimi Passi:');
            console.log('   1. Avvia server: npm run dev');
            console.log('   2. Vai a: http://localhost:3000/prenota');
            console.log('   3. Seleziona Michele');
            console.log('   4. Cerca console log: 🔓 2025-10-30: EXCEPTIONAL OPENING');
            console.log('   5. Verifica che 30 ottobre sia cliccabile');
        } else {
            console.log('\n❌ PROBLEMA RILEVATO!');
            console.log('\nDettagli:');
            if (schedule.length === 0) console.log('   ❌ Nessuno schedule trovato');
            if (schedule.length > 0 && schedule[0].day_off) console.log('   ❌ day_off=true');
            if (allSlots.length === 0) console.log('   ❌ Nessuno slot disponibile');
            if (!hasSlots) console.log('   ❌ Tutti gli slot prenotati');
            if (!isRecurringClosed) console.log('   ⚠️ Giovedì non è normalmente chiuso');
        }
        
        // 6. Additional Info
        console.log('\n📊 STATISTICHE:');
        const totalSchedules = await sql`
            SELECT COUNT(*) as count FROM barber_schedules 
            WHERE barber_id = ${barberId} AND date >= CURRENT_DATE
        `;
        
        const openSchedules = await sql`
            SELECT COUNT(*) as count FROM barber_schedules 
            WHERE barber_id = ${barberId} 
            AND date >= CURRENT_DATE 
            AND day_off = false
        `;
        
        console.log(`   - Schedule futuri totali: ${totalSchedules[0].count}`);
        console.log(`   - Schedule aperti (day_off=false): ${openSchedules[0].count}`);
        
        // Find all exceptional openings
        const exceptionalOpeningsQuery = await sql`
            SELECT bs.date, bs.day_off, bs.available_slots
            FROM barber_schedules bs
            WHERE bs.barber_id = ${barberId}
            AND bs.date >= CURRENT_DATE
            AND bs.day_off = false
            ORDER BY bs.date ASC
        `;
        
        if (exceptionalOpeningsQuery.length > 0) {
            console.log(`\n🔓 TUTTE LE APERTURE ECCEZIONALI (day_off=false):`);
            for (const opening of exceptionalOpeningsQuery) {
                const date = new Date(opening.date);
                const dayName = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][date.getDay()];
                const slots = JSON.parse(opening.available_slots);
                const dateStr = opening.date.toISOString().split('T')[0];
                
                // Check if this day is normally closed
                const isNormallyClosed = closedDays.includes(date.getDay());
                const label = isNormallyClosed ? '🔓 ECCEZIONALE' : '📅 NORMALE';
                
                console.log(`   ${label} ${dateStr} (${dayName}): ${slots.length} slot`);
            }
        }
        
    } catch (error) {
        console.error('\n❌ ERRORE:', error);
        throw error;
    }
}

finalVerification()
    .then(() => {
        console.log('\n✅ Verifica completata');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Verifica fallita:', error);
        process.exit(1);
    });
