import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkThursdayOctober30() {
    const date = '2025-10-30';
    const micheleEmail = 'michelebiancofiore0230@gmail.com';
    
    console.log(`\n🔍 Verifica completa: ${date} (Giovedì)`);
    console.log('='.repeat(70));
    
    try {
        // 1. Verifica chiusure ricorrenti Michele
        console.log('\n1️⃣ Chiusure Ricorrenti Michele:');
        const recurring = await sql`
            SELECT * FROM barber_recurring_closures 
            WHERE barber_email = ${micheleEmail}
        `;
        
        if (recurring.length > 0) {
            const closedDays = JSON.parse(recurring[0].closed_days);
            const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
            console.log(`   Giorni chiusi: ${closedDays.map(d => dayNames[d]).join(', ')}`);
            console.log(`   Giovedì (4) chiuso: ${closedDays.includes(4) ? '✅ SÌ' : '❌ NO'}`);
        } else {
            console.log('   ❌ Nessuna chiusura ricorrente trovata');
        }
        
        // 2. Verifica schedule specifico 30 ottobre
        console.log('\n2️⃣ Schedule per 30 Ottobre:');
        const michele = await sql`SELECT id FROM barbers WHERE email = ${micheleEmail}`;
        
        if (michele.length === 0) {
            console.log('   ❌ Michele non trovato');
            return;
        }
        
        const micheleId = michele[0].id;
        const schedule = await sql`
            SELECT * FROM barber_schedules 
            WHERE barber_id = ${micheleId} AND date = ${date}
        `;
        
        if (schedule.length > 0) {
            console.log(`   ✅ Schedule trovato:`);
            console.log(`      day_off: ${schedule[0].day_off}`);
            console.log(`      available_slots: ${schedule[0].available_slots}`);
            const slots = JSON.parse(schedule[0].available_slots);
            console.log(`      Numero slot: ${slots.length}`);
        } else {
            console.log('   ❌ Nessuno schedule trovato per questa data');
        }
        
        // 3. Verifica chiusure specifiche
        console.log('\n3️⃣ Chiusure Specifiche per 30 Ottobre:');
        const closures = await sql`
            SELECT * FROM barber_closures 
            WHERE barber_email = ${micheleEmail} AND closure_date = ${date}
        `;
        
        if (closures.length > 0) {
            console.log(`   ⚠️ Trovate ${closures.length} chiusure specifiche:`);
            closures.forEach(c => {
                console.log(`      - Tipo: ${c.closure_type}, Motivo: ${c.reason || 'N/A'}`);
            });
        } else {
            console.log('   ✅ Nessuna chiusura specifica');
        }
        
        // 4. Conclusione
        console.log('\n' + '='.repeat(70));
        console.log('📊 DIAGNOSI:');
        console.log('='.repeat(70));
        
        if (schedule.length > 0 && !schedule[0].day_off) {
            const slots = JSON.parse(schedule[0].available_slots);
            console.log(`✅ Michele DOVREBBE essere aperto con ${slots.length} slot`);
        } else {
            console.log('❌ Michele risulta CHIUSO');
            console.log('   Possibili cause:');
            if (recurring.length > 0 && JSON.parse(recurring[0].closed_days).includes(4)) {
                console.log('   - Chiusura ricorrente giovedì attiva');
            }
            if (schedule.length === 0) {
                console.log('   - Nessuno schedule creato per questa data');
            } else if (schedule[0].day_off) {
                console.log('   - Schedule ha day_off=true');
            }
            if (closures.length > 0) {
                console.log('   - Chiusure specifiche presenti');
            }
        }
        
    } catch (error) {
        console.error('\n❌ ERRORE:', error);
        throw error;
    }
}

checkThursdayOctober30()
    .then(() => {
        console.log('\n✅ Verifica completata');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Verifica fallita:', error);
        process.exit(1);
    });
