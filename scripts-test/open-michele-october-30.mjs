import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function openMicheleOctober30() {
    const date = '2025-10-30'; // Giovedì
    const micheleEmail = 'michelebiancofiore0230@gmail.com';
    
    console.log(`\n🔓 Apertura eccezionale: Michele - ${date} (Giovedì)`);
    
    try {
        // 1. Get Michele's barber ID
        const michele = await sql`
            SELECT * FROM barbers WHERE email = ${micheleEmail}
        `;
        
        if (michele.length === 0) {
            console.log('❌ Michele non trovato nel database');
            return;
        }
        
        const micheleId = michele[0].id;
        console.log(`\n✅ Michele trovato: ${michele[0].name} (${micheleId})`);
        
        // 2. Check if there's already a schedule for this date
        const existingSchedule = await sql`
            SELECT * FROM barber_schedules 
            WHERE barber_id = ${micheleId} AND date = ${date}
        `;
        
        // 3. Prepare full day slots (all slots including Saturday style)
        const fullDaySlots = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "12:00", "12:30",
            "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
        ];
        
        if (existingSchedule.length > 0) {
            console.log(`\n📅 Schedule esistente trovato per ${date}:`);
            console.log(`   day_off: ${existingSchedule[0].day_off}`);
            console.log(`   available_slots: ${existingSchedule[0].available_slots}`);
            
            // Update existing schedule to be open full day
            await sql`
                UPDATE barber_schedules 
                SET day_off = false,
                    available_slots = ${JSON.stringify(fullDaySlots)},
                    updated_at = NOW()
                WHERE barber_id = ${micheleId} AND date = ${date}
            `;
            
            console.log(`\n✅ Schedule aggiornato per ${date}:`);
            console.log(`   day_off: false`);
            console.log(`   available_slots: ${JSON.stringify(fullDaySlots)}`);
        } else {
            // Create new schedule
            await sql`
                INSERT INTO barber_schedules (barber_id, date, available_slots, unavailable_slots, day_off)
                VALUES (${micheleId}, ${date}, ${JSON.stringify(fullDaySlots)}, '[]', false)
            `;
            
            console.log(`\n✅ Nuovo schedule creato per ${date}:`);
            console.log(`   day_off: false`);
            console.log(`   available_slots: ${JSON.stringify(fullDaySlots)}`);
        }
        
        // 4. Verify the update
        const updatedSchedule = await sql`
            SELECT * FROM barber_schedules 
            WHERE barber_id = ${micheleId} AND date = ${date}
        `;
        
        console.log(`\n🎉 VERIFICA FINALE:`);
        console.log(`   Barbiere: Michele`);
        console.log(`   Data: ${date} (Giovedì)`);
        console.log(`   day_off: ${updatedSchedule[0].day_off}`);
        console.log(`   Slot disponibili: ${JSON.parse(updatedSchedule[0].available_slots).length}`);
        console.log(`   Orari: ${updatedSchedule[0].available_slots}`);
        
        console.log(`\n✅ Michele è ora aperto tutto il giorno il 30 ottobre 2025!`);
        
    } catch (error) {
        console.error('\n❌ ERRORE:', error);
        throw error;
    }
}

// Esegui script
openMicheleOctober30()
    .then(() => {
        console.log('\n✅ Script completato');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script fallito:', error);
        process.exit(1);
    });
