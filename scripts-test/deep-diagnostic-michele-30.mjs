import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function deepDiagnostic() {
    const date = '2025-10-30';
    const micheleEmail = 'michelebiancofiore0230@gmail.com';
    
    console.log('\n🔍 DIAGNOSI COMPLETA - Michele 30 Ottobre 2025');
    console.log('='.repeat(80));
    
    try {
        // 1. Get Michele info
        const michele = await sql`
            SELECT * FROM barbers WHERE email = ${micheleEmail}
        `;
        
        if (michele.length === 0) {
            console.log('❌ Michele non trovato');
            return;
        }
        
        const micheleId = michele[0].id;
        const micheleName = michele[0].name;
        
        console.log(`\n✅ Barbiere: ${micheleName} (ID: ${micheleId})`);
        
        // 2. Check recurring closures
        console.log('\n📋 CHIUSURE RICORRENTI:');
        const recurring = await sql`
            SELECT * FROM barber_recurring_closures 
            WHERE barber_email = ${micheleEmail}
        `;
        
        if (recurring.length > 0) {
            const closedDays = JSON.parse(recurring[0].closed_days);
            const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
            console.log(`   Giorni chiusi: ${closedDays.map(d => dayNames[d]).join(', ')}`);
            console.log(`   Giovedì (4): ${closedDays.includes(4) ? '❌ CHIUSO' : '✅ APERTO'}`);
        } else {
            console.log('   ✅ Nessuna chiusura ricorrente');
        }
        
        // 3. Check specific schedule for 30 Oct
        console.log('\n📅 SCHEDULE 30 OTTOBRE:');
        const schedule = await sql`
            SELECT * FROM barber_schedules 
            WHERE barber_id = ${micheleId} AND date = ${date}
        `;
        
        if (schedule.length > 0) {
            const s = schedule[0];
            console.log(`   ✅ Schedule trovato:`);
            console.log(`   - day_off: ${s.day_off}`);
            console.log(`   - available_slots: ${s.available_slots}`);
            const slots = JSON.parse(s.available_slots);
            console.log(`   - Numero slot: ${slots.length}`);
            console.log(`   - Slot: ${slots.slice(0, 5).join(', ')}${slots.length > 5 ? '...' : ''}`);
        } else {
            console.log('   ❌ Nessuno schedule trovato');
        }
        
        // 4. Check specific closures
        console.log('\n🚫 CHIUSURE SPECIFICHE 30 OTTOBRE:');
        const closures = await sql`
            SELECT * FROM barber_closures 
            WHERE barber_email = ${micheleEmail} AND closure_date = ${date}
        `;
        
        if (closures.length > 0) {
            console.log(`   ⚠️ Trovate ${closures.length} chiusure:`);
            closures.forEach(c => {
                console.log(`   - Tipo: ${c.closure_type}, Motivo: ${c.reason || 'N/A'}`);
            });
        } else {
            console.log('   ✅ Nessuna chiusura specifica');
        }
        
        // 5. Test API batch-availability
        console.log('\n🌐 TEST API /api/bookings/batch-availability:');
        console.log('   Simulazione chiamata...');
        
        const testUrl = 'http://localhost:3000/api/bookings/batch-availability';
        
        try {
            const response = await fetch(testUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    barberId: micheleId,
                    dates: [date]
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                const avail = data.availability[date];
                
                console.log(`   ✅ Risposta API ricevuta:`);
                console.log(`   - hasSlots: ${avail.hasSlots}`);
                console.log(`   - availableCount: ${avail.availableCount}`);
                console.log(`   - totalSlots: ${avail.totalSlots}`);
                
                if (avail.hasSlots) {
                    console.log('\n   ✅ API dice: GIORNO DISPONIBILE');
                } else {
                    console.log('\n   ❌ API dice: GIORNO NON DISPONIBILE');
                }
            } else {
                console.log(`   ❌ Errore API: ${response.status}`);
                const errorText = await response.text();
                console.log(`   ${errorText}`);
            }
        } catch (error) {
            console.log(`   ⚠️ Server non raggiungibile (probabilmente non in esecuzione)`);
            console.log(`   Errore: ${error.message}`);
        }
        
        // 6. Test API slots
        console.log('\n🎯 TEST API /api/bookings/slots:');
        
        try {
            const slotsUrl = `http://localhost:3000/api/bookings/slots?barberId=${micheleId}&date=${date}`;
            const slotsResponse = await fetch(slotsUrl);
            
            if (slotsResponse.ok) {
                const slots = await slotsResponse.json();
                console.log(`   ✅ Risposta API ricevuta:`);
                console.log(`   - Numero slot disponibili: ${slots.length}`);
                if (slots.length > 0) {
                    console.log(`   - Primi slot: ${slots.slice(0, 5).map(s => s.time).join(', ')}`);
                } else {
                    console.log('   - Nessuno slot disponibile');
                }
            } else {
                console.log(`   ❌ Errore API: ${slotsResponse.status}`);
            }
        } catch (error) {
            console.log(`   ⚠️ Server non raggiungibile`);
        }
        
        // 7. Summary and diagnosis
        console.log('\n' + '='.repeat(80));
        console.log('📊 DIAGNOSI FINALE:');
        console.log('='.repeat(80));
        
        const hasSchedule = schedule.length > 0;
        const isDayOff = schedule.length > 0 ? schedule[0].day_off : true;
        const hasSlots = schedule.length > 0 ? JSON.parse(schedule[0].available_slots).length > 0 : false;
        const hasRecurringClosure = recurring.length > 0 && JSON.parse(recurring[0].closed_days).includes(4);
        const hasSpecificClosure = closures.length > 0;
        
        console.log('\n✅ STATO CORRENTE:');
        console.log(`   - Schedule esistente: ${hasSchedule ? 'SÌ' : 'NO'}`);
        if (hasSchedule) {
            console.log(`   - day_off: ${isDayOff}`);
            console.log(`   - Ha slot: ${hasSlots}`);
        }
        console.log(`   - Chiusura ricorrente giovedì: ${hasRecurringClosure ? 'SÌ' : 'NO'}`);
        console.log(`   - Chiusura specifica 30 ott: ${hasSpecificClosure ? 'SÌ' : 'NO'}`);
        
        console.log('\n🎯 VERDICT:');
        if (hasSchedule && !isDayOff && hasSlots && !hasSpecificClosure) {
            console.log('   ✅ Michele DOVREBBE essere visibile come APERTO');
            console.log('   ✅ Database configurato correttamente');
            console.log('   ⚠️ Se il frontend mostra "Chiuso", il problema è:');
            console.log('      1. Cache del browser/server');
            console.log('      2. L\'API non viene chiamata correttamente');
            console.log('      3. Il frontend controlla le chiusure ricorrenti localmente');
        } else {
            console.log('   ❌ Michele risulta CHIUSO per i seguenti motivi:');
            if (!hasSchedule) console.log('      - Nessuno schedule trovato');
            if (hasSchedule && isDayOff) console.log('      - day_off=true nello schedule');
            if (hasSchedule && !hasSlots) console.log('      - Nessuno slot disponibile');
            if (hasSpecificClosure) console.log('      - Chiusura specifica presente');
        }
        
    } catch (error) {
        console.error('\n❌ ERRORE:', error);
        throw error;
    }
}

deepDiagnostic()
    .then(() => {
        console.log('\n✅ Diagnosi completata');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Diagnosi fallita:', error);
        process.exit(1);
    });
