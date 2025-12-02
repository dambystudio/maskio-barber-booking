import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixMicheleOct30() {
    console.log('\n🔧 FIX MICHELE 30 OTTOBRE - APERTURA ECCEZIONALE');
    console.log('='.repeat(80));
    
    const testDate = '2025-10-30';
    const micheleEmail = 'michelebiancofiore0230@gmail.com';
    
    try {
        const michele = await sql`SELECT id FROM barbers WHERE email = ${micheleEmail}`;
        const barberId = michele[0].id;
        
        // Simply UPDATE the existing schedule
        const result = await sql`
            UPDATE barber_schedules 
            SET 
                day_off = false,
                updated_at = NOW()
            WHERE barber_id = ${barberId} AND date = ${testDate}
            RETURNING *
        `;
        
        if (result.length > 0) {
            const slots = JSON.parse(result[0].available_slots);
            console.log('✅ SCHEDULE AGGIORNATO!');
            console.log(`   - day_off: ${result[0].day_off} (era TRUE, ora FALSE)`);
            console.log(`   - available_slots: ${slots.length} slot`);
            console.log(`   - Slot: ${slots.join(', ')}`);
            
            // Check for specific closures
            const closures = await sql`
                SELECT * FROM barber_closures 
                WHERE barber_email = ${micheleEmail} AND closure_date = ${testDate}
            `;
            
            if (closures.length > 0) {
                console.log(`\n⚠️ TROVATE ${closures.length} CHIUSURE SPECIFICHE - Elimino...`);
                await sql`
                    DELETE FROM barber_closures 
                    WHERE barber_email = ${micheleEmail} AND closure_date = ${testDate}
                `;
                console.log('✅ Chiusure eliminate');
            }
            
            console.log('\n🎉 FATTO!');
            console.log('📝 ORA:');
            console.log('   1. Vai a: https://www.maskiobarberconcept.it/prenota');
            console.log('   2. Premi Ctrl+Shift+R (hard refresh)');
            console.log('   3. Seleziona Michele');
            console.log('   4. Verifica che 30 ottobre sia cliccabile');
        } else {
            console.log('❌ Nessuno schedule trovato da aggiornare');
        }
        
    } catch (error) {
        console.error('❌ ERRORE:', error);
        throw error;
    }
}

fixMicheleOct30()
    .then(() => {
        console.log('\n✅ Completato\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Fallito:', error);
        process.exit(1);
    });
