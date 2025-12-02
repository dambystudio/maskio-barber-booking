import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function recreateExceptionalOpening() {
    console.log('\n🔧 RICREAZIONE APERTURA ECCEZIONALE MICHELE - 30 OTTOBRE');
    console.log('='.repeat(80));
    
    const testDate = '2025-10-30';
    const micheleEmail = 'michelebiancofiore0230@gmail.com';
    
    try {
        // 1. Get Michele
        const michele = await sql`
            SELECT id FROM barbers WHERE email = ${micheleEmail}
        `;
        
        if (michele.length === 0) {
            console.log('❌ Michele non trovato');
            return;
        }
        
        const barberId = michele[0].id;
        console.log(`✅ Barbiere: Michele (ID: ${barberId})`);
        
        // 2. Check current state
        console.log('\n📅 Controllo stato attuale...');
        const currentSchedule = await sql`
            SELECT * FROM barber_schedules 
            WHERE barber_id = ${barberId} AND date = ${testDate}
        `;
        
        if (currentSchedule.length > 0) {
            console.log(`   ⚠️ Schedule esistente trovato:`);
            console.log(`   - day_off: ${currentSchedule[0].day_off}`);
            console.log(`   - available_slots: ${JSON.parse(currentSchedule[0].available_slots).length} slot`);
            console.log(`\n   🔄 Aggiorno schedule esistente...`);
        } else {
            console.log(`   ℹ️ Nessuno schedule trovato, ne creo uno nuovo...`);
        }
        
        // 3. Create/Update exceptional opening
        // Giovedì normale: 09:00-12:30, 15:00-17:30 (14 slot)
        const thursdaySlots = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
            '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
        ];
        
        const result = await sql`
            INSERT INTO barber_schedules (barber_id, date, available_slots, unavailable_slots, day_off)
            VALUES (
                ${barberId}, 
                ${testDate}, 
                ${JSON.stringify(thursdaySlots)}, 
                '[]', 
                false
            )
            ON CONFLICT (barber_id, date) 
            DO UPDATE SET 
                available_slots = ${JSON.stringify(thursdaySlots)},
                unavailable_slots = '[]',
                day_off = false,
                updated_at = NOW()
            RETURNING *
        `;
        
        console.log('\n✅ APERTURA ECCEZIONALE CREATA!');
        console.log(`   - Date: ${testDate}`);
        console.log(`   - day_off: ${result[0].day_off}`);
        console.log(`   - Slot: ${thursdaySlots.length}`);
        console.log(`   - Orari: ${thursdaySlots.slice(0, 4).join(', ')}...`);
        
        // 4. Verify no specific closures
        const closures = await sql`
            SELECT * FROM barber_closures 
            WHERE barber_email = ${micheleEmail} AND closure_date = ${testDate}
        `;
        
        if (closures.length > 0) {
            console.log('\n⚠️ ATTENZIONE: Trovate chiusure specifiche per questa data!');
            console.log('   Queste hanno priorità sulle aperture eccezionali.');
            console.log('   Elimino le chiusure...\n');
            
            await sql`
                DELETE FROM barber_closures 
                WHERE barber_email = ${micheleEmail} AND closure_date = ${testDate}
            `;
            
            console.log(`   ✅ ${closures.length} chiusure eliminate`);
        }
        
        // 5. Final verification
        console.log('\n' + '='.repeat(80));
        console.log('🎯 VERIFICA FINALE:');
        console.log('='.repeat(80));
        
        const finalSchedule = await sql`
            SELECT * FROM barber_schedules 
            WHERE barber_id = ${barberId} AND date = ${testDate}
        `;
        
        const finalSlots = JSON.parse(finalSchedule[0].available_slots);
        
        console.log(`✅ Schedule configurato:`);
        console.log(`   - day_off: ${finalSchedule[0].day_off ? '❌ TRUE' : '✅ FALSE'}`);
        console.log(`   - available_slots: ${finalSlots.length} slot`);
        console.log(`   - updated_at: ${finalSchedule[0].updated_at}`);
        
        if (!finalSchedule[0].day_off && finalSlots.length > 0) {
            console.log('\n🎉 CONFIGURAZIONE COMPLETATA CON SUCCESSO!');
            console.log('\n📝 PROSSIMI PASSI:');
            console.log('   1. Vai al sito: https://www.maskiobarberconcept.it/prenota');
            console.log('   2. Hard refresh: Ctrl+Shift+R');
            console.log('   3. Seleziona Michele');
            console.log('   4. Verifica che 30 ottobre sia disponibile');
        } else {
            console.log('\n❌ PROBLEMA: Configurazione non valida');
        }
        
    } catch (error) {
        console.error('\n❌ ERRORE:', error);
        throw error;
    }
}

recreateExceptionalOpening()
    .then(() => {
        console.log('\n✅ Operazione completata\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Operazione fallita:', error);
        process.exit(1);
    });
