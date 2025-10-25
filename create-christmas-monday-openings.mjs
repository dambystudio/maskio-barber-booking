import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createChristmasOpenings() {
    console.log('\n🎄 APERTURE ECCEZIONALI NATALE - Lunedì 22 e 29 Dicembre');
    console.log('='.repeat(80));
    
    try {
        // Get barbers
        const fabio = await sql`SELECT id, name FROM barbers WHERE email = 'fabio.cassano97@icloud.com'`;
        const michele = await sql`SELECT id, name FROM barbers WHERE email = 'michelebiancofiore0230@gmail.com'`;
        
        if (fabio.length === 0 || michele.length === 0) {
            throw new Error('Barbieri non trovati!');
        }
        
        const fabioId = fabio[0].id;
        const micheleId = michele[0].id;
        
        console.log(`\n✅ Barbieri trovati:`);
        console.log(`   - Fabio: ${fabioId}`);
        console.log(`   - Michele: ${micheleId}`);
        
        // Full day slots: 9:00-12:30, 15:00-18:00
        const fullDaySlots = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
            "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
        ];
        
        const dates = ['2025-12-22', '2025-12-29'];
        
        for (const date of dates) {
            console.log(`\n📅 Processando ${date} (Lunedì)...`);
            
            // FABIO - normalmente chiuso il lunedì
            console.log(`\n   👤 Fabio (normalmente chiuso):`);
            
            const fabioExisting = await sql`
                SELECT * FROM barber_schedules 
                WHERE barber_id = ${fabioId} AND date = ${date}
            `;
            
            if (fabioExisting.length > 0) {
                // Update existing schedule
                await sql`
                    UPDATE barber_schedules 
                    SET day_off = false,
                        available_slots = ${JSON.stringify(fullDaySlots)},
                        unavailable_slots = ${JSON.stringify([])},
                        updated_at = NOW()
                    WHERE barber_id = ${fabioId} AND date = ${date}
                `;
                console.log(`      ✅ Schedule aggiornato: day_off=false, ${fullDaySlots.length} slot`);
            } else {
                // Create new schedule
                await sql`
                    INSERT INTO barber_schedules (barber_id, date, available_slots, unavailable_slots, day_off)
                    VALUES (${fabioId}, ${date}, ${JSON.stringify(fullDaySlots)}, ${JSON.stringify([])}, false)
                `;
                console.log(`      ✅ Schedule creato: day_off=false, ${fullDaySlots.length} slot`);
            }
            
            // MICHELE - normalmente solo pomeriggio
            console.log(`\n   👤 Michele (normalmente solo pomeriggio):`);
            
            const micheleExisting = await sql`
                SELECT * FROM barber_schedules 
                WHERE barber_id = ${micheleId} AND date = ${date}
            `;
            
            if (micheleExisting.length > 0) {
                // Update existing schedule
                await sql`
                    UPDATE barber_schedules 
                    SET day_off = false,
                        available_slots = ${JSON.stringify(fullDaySlots)},
                        unavailable_slots = ${JSON.stringify([])},
                        updated_at = NOW()
                    WHERE barber_id = ${micheleId} AND date = ${date}
                `;
                console.log(`      ✅ Schedule aggiornato: day_off=false, ${fullDaySlots.length} slot`);
            } else {
                // Create new schedule
                await sql`
                    INSERT INTO barber_schedules (barber_id, date, available_slots, unavailable_slots, day_off)
                    VALUES (${micheleId}, ${date}, ${JSON.stringify(fullDaySlots)}, ${JSON.stringify([])}, false)
                `;
                console.log(`      ✅ Schedule creato: day_off=false, ${fullDaySlots.length} slot`);
            }
        }
        
        // Verify final state
        console.log('\n' + '='.repeat(80));
        console.log('🔍 VERIFICA FINALE:\n');
        
        for (const date of dates) {
            console.log(`📅 ${date}:`);
            
            const fabioSchedule = await sql`
                SELECT day_off, available_slots FROM barber_schedules 
                WHERE barber_id = ${fabioId} AND date = ${date}
            `;
            
            const micheleSchedule = await sql`
                SELECT day_off, available_slots FROM barber_schedules 
                WHERE barber_id = ${micheleId} AND date = ${date}
            `;
            
            if (fabioSchedule.length > 0) {
                const slots = JSON.parse(fabioSchedule[0].available_slots);
                console.log(`   Fabio: day_off=${fabioSchedule[0].day_off}, slot=${slots.length}`);
                console.log(`          ${slots.join(', ')}`);
            }
            
            if (micheleSchedule.length > 0) {
                const slots = JSON.parse(micheleSchedule[0].available_slots);
                console.log(`   Michele: day_off=${micheleSchedule[0].day_off}, slot=${slots.length}`);
                console.log(`            ${slots.join(', ')}`);
            }
            
            console.log('');
        }
        
        console.log('='.repeat(80));
        console.log('🎉 APERTURE ECCEZIONALI NATALE COMPLETATE!\n');
        console.log('📝 COSA È STATO FATTO:');
        console.log('   ✅ Fabio: aperto 9-18 (invece di chiuso) il 22 e 29 dicembre');
        console.log('   ✅ Michele: aperto 9-18 (invece di 15-18) il 22 e 29 dicembre');
        console.log('   ✅ 17 slot disponibili per barbiere per giorno');
        console.log('\n🌐 Vai su https://www.maskiobarberconcept.it/prenota per verificare!');
        
    } catch (error) {
        console.error('❌ ERRORE:', error);
        throw error;
    }
}

createChristmasOpenings()
    .then(() => {
        console.log('\n✅ Script completato\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Script fallito:', error);
        process.exit(1);
    });
