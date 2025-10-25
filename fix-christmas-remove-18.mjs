import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixChristmasSlots() {
    console.log('\n🔧 RIMOZIONE SLOT 18:00 - 22 e 29 Dicembre');
    console.log('='.repeat(80));
    
    try {
        // Get barbers
        const fabio = await sql`SELECT id, name FROM barbers WHERE email = 'fabio.cassano97@icloud.com'`;
        const michele = await sql`SELECT id, name FROM barbers WHERE email = 'michelebiancofiore0230@gmail.com'`;
        
        // Correct slots: 9:00-12:30, 15:00-17:30 (NO 18:00)
        const correctSlots = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
            "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
        ];
        
        console.log(`\n✅ Slot corretti (14 slot, ultimo 17:30):`);
        console.log(`   ${correctSlots.join(', ')}\n`);
        
        const dates = ['2025-12-22', '2025-12-29'];
        
        for (const date of dates) {
            console.log(`📅 Processando ${date}...`);
            
            // FABIO
            const fabioSchedule = await sql`
                SELECT available_slots FROM barber_schedules 
                WHERE barber_id = ${fabio[0].id} AND date = ${date}
            `;
            
            if (fabioSchedule.length > 0) {
                const currentSlots = JSON.parse(fabioSchedule[0].available_slots);
                console.log(`   Fabio - prima: ${currentSlots.length} slot`);
                
                await sql`
                    UPDATE barber_schedules 
                    SET available_slots = ${JSON.stringify(correctSlots)},
                        updated_at = NOW()
                    WHERE barber_id = ${fabio[0].id} AND date = ${date}
                `;
                
                console.log(`   Fabio - dopo: ${correctSlots.length} slot ✅`);
            }
            
            // MICHELE
            const micheleSchedule = await sql`
                SELECT available_slots FROM barber_schedules 
                WHERE barber_id = ${michele[0].id} AND date = ${date}
            `;
            
            if (micheleSchedule.length > 0) {
                const currentSlots = JSON.parse(micheleSchedule[0].available_slots);
                console.log(`   Michele - prima: ${currentSlots.length} slot`);
                
                await sql`
                    UPDATE barber_schedules 
                    SET available_slots = ${JSON.stringify(correctSlots)},
                        updated_at = NOW()
                    WHERE barber_id = ${michele[0].id} AND date = ${date}
                `;
                
                console.log(`   Michele - dopo: ${correctSlots.length} slot ✅`);
            }
            
            console.log('');
        }
        
        // Check for existing bookings at 18:00
        console.log('='.repeat(80));
        console.log('🔍 VERIFICA PRENOTAZIONI ALLE 18:00:\n');
        
        for (const date of dates) {
            const bookings18 = await sql`
                SELECT b.*, barbers.name as barber_name 
                FROM bookings b
                JOIN barbers ON b.barber_id = barbers.id
                WHERE b.date = ${date} 
                AND b.time = '18:00'
                AND b.status != 'cancelled'
            `;
            
            if (bookings18.length > 0) {
                console.log(`⚠️ ${date}: Trovate ${bookings18.length} prenotazioni alle 18:00:`);
                bookings18.forEach(b => {
                    console.log(`   - ${b.barber_name}: ${b.customer_name} (${b.customer_email})`);
                });
                console.log('   ❌ Queste prenotazioni devono essere spostate o cancellate!\n');
            } else {
                console.log(`✅ ${date}: Nessuna prenotazione alle 18:00\n`);
            }
        }
        
        // Verify final state
        console.log('='.repeat(80));
        console.log('🔍 VERIFICA FINALE:\n');
        
        for (const date of dates) {
            console.log(`📅 ${date}:`);
            
            const fabioFinal = await sql`
                SELECT available_slots FROM barber_schedules 
                WHERE barber_id = ${fabio[0].id} AND date = ${date}
            `;
            
            const micheleFinal = await sql`
                SELECT available_slots FROM barber_schedules 
                WHERE barber_id = ${michele[0].id} AND date = ${date}
            `;
            
            if (fabioFinal.length > 0) {
                const slots = JSON.parse(fabioFinal[0].available_slots);
                const hasSlot18 = slots.includes('18:00');
                console.log(`   Fabio: ${slots.length} slot, ultimo=${slots[slots.length-1]} ${hasSlot18 ? '❌' : '✅'}`);
            }
            
            if (micheleFinal.length > 0) {
                const slots = JSON.parse(micheleFinal[0].available_slots);
                const hasSlot18 = slots.includes('18:00');
                console.log(`   Michele: ${slots.length} slot, ultimo=${slots[slots.length-1]} ${hasSlot18 ? '❌' : '✅'}`);
            }
            
            console.log('');
        }
        
        console.log('='.repeat(80));
        console.log('✅ MODIFICA COMPLETATA!');
        console.log('   Slot 18:00 rimosso per entrambi i barbieri');
        console.log('   Ultimo slot disponibile: 17:30');
        
    } catch (error) {
        console.error('❌ ERRORE:', error);
        throw error;
    }
}

fixChristmasSlots()
    .then(() => {
        console.log('\n✅ Script completato\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Script fallito:', error);
        process.exit(1);
    });
