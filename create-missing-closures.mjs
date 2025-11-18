/**
 * Crea chiusure automatiche mancanti direttamente nel database
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function createMissingClosures() {
    console.log('🔧 CREAZIONE CHIUSURE AUTOMATICHE MANCANTI\n');
    
    try {
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + 60);
        
        console.log(`Periodo: ${today.toISOString().split('T')[0]} → ${futureDate.toISOString().split('T')[0]}\n`);
        
        let micheleCount = 0;
        let fabioCount = 0;
        
        // Per ogni lunedì nei prossimi 60 giorni
        for (let d = new Date(today); d <= futureDate; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            
            // Solo lunedì (1)
            if (dayOfWeek === 1) {
                const dateString = d.toISOString().split('T')[0];
                
                // Michele - MORNING closure
                const micheleExists = await sql`
                    SELECT id FROM barber_closures
                    WHERE barber_email = 'michelebiancofiore0230@gmail.com'
                    AND closure_date = ${dateString}
                    AND closure_type = 'morning'
                `;
                
                if (micheleExists.length === 0) {
                    await sql`
                        INSERT INTO barber_closures (
                            barber_email,
                            closure_date,
                            closure_type,
                            reason,
                            created_by
                        ) VALUES (
                            'michelebiancofiore0230@gmail.com',
                            ${dateString},
                            'morning',
                            'Chiusura automatica - Solo pomeriggio il lunedì',
                            'system-auto'
                        )
                    `;
                    micheleCount++;
                    console.log(`✅ Michele ${dateString}: MORNING closure creata`);
                }
                
                // Fabio - FULL closure
                const fabioExists = await sql`
                    SELECT id FROM barber_closures
                    WHERE barber_email = 'fabio.cassano97@icloud.com'
                    AND closure_date = ${dateString}
                    AND closure_type = 'full'
                `;
                
                if (fabioExists.length === 0) {
                    await sql`
                        INSERT INTO barber_closures (
                            barber_email,
                            closure_date,
                            closure_type,
                            reason,
                            created_by
                        ) VALUES (
                            'fabio.cassano97@icloud.com',
                            ${dateString},
                            'full',
                            'Chiusura automatica - Riposo settimanale',
                            'system-auto'
                        )
                    `;
                    fabioCount++;
                    console.log(`✅ Fabio ${dateString}: FULL closure creata`);
                }
            }
        }
        
        console.log('\n\n📊 RIEPILOGO');
        console.log('=============');
        console.log(`Michele - Chiusure MORNING create: ${micheleCount}`);
        console.log(`Fabio - Chiusure FULL create: ${fabioCount}`);
        
        if (micheleCount === 0 && fabioCount === 0) {
            console.log('\n✅ Tutte le chiusure sono già presenti!');
        } else {
            console.log('\n✅ Chiusure create con successo!');
        }
        
        // Ora aggiorna gli schedules per rimuovere gli slot mattutini di Michele
        console.log('\n\n🔄 AGGIORNAMENTO SCHEDULES MICHELE (rimozione slot mattutini lunedì)...\n');
        
        const micheleMondays = await sql`
            SELECT bs.date, bs.available_slots
            FROM barber_schedules bs
            JOIN barbers b ON bs.barber_id = b.id
            WHERE b.email = 'michelebiancofiore0230@gmail.com'
            AND EXTRACT(DOW FROM bs.date::date) = 1
            AND bs.date >= ${today.toISOString().split('T')[0]}
        `;
        
        let updatedCount = 0;
        for (const schedule of micheleMondays) {
            const slots = JSON.parse(schedule.available_slots);
            // Filtra solo slot pomeridiani (>= 15:00)
            const afternoonSlots = slots.filter(slot => {
                const hour = parseInt(slot.split(':')[0]);
                return hour >= 15;
            });
            
            if (afternoonSlots.length !== slots.length) {
                await sql`
                    UPDATE barber_schedules
                    SET available_slots = ${JSON.stringify(afternoonSlots)}
                    WHERE date = ${schedule.date}
                    AND barber_id IN (SELECT id FROM barbers WHERE email = 'michelebiancofiore0230@gmail.com')
                `;
                updatedCount++;
                console.log(`✅ ${schedule.date}: ${slots.length} → ${afternoonSlots.length} slots`);
            }
        }
        
        console.log(`\n📊 Schedules Michele aggiornati: ${updatedCount}`);
        
        // Aggiorna schedules Fabio per rimuovere tutti gli slot lunedì
        console.log('\n\n🔄 AGGIORNAMENTO SCHEDULES FABIO (rimozione tutti slot lunedì)...\n');
        
        const fabioMondays = await sql`
            SELECT bs.date, bs.available_slots
            FROM barber_schedules bs
            JOIN barbers b ON bs.barber_id = b.id
            WHERE b.email = 'fabio.cassano97@icloud.com'
            AND EXTRACT(DOW FROM bs.date::date) = 1
            AND bs.date >= ${today.toISOString().split('T')[0]}
        `;
        
        let fabioUpdatedCount = 0;
        for (const schedule of fabioMondays) {
            const slots = JSON.parse(schedule.available_slots);
            
            if (slots.length > 0) {
                await sql`
                    UPDATE barber_schedules
                    SET available_slots = '[]',
                        day_off = true
                    WHERE date = ${schedule.date}
                    AND barber_id IN (SELECT id FROM barbers WHERE email = 'fabio.cassano97@icloud.com')
                `;
                fabioUpdatedCount++;
                console.log(`✅ ${schedule.date}: ${slots.length} → 0 slots (day_off=true)`);
            }
        }
        
        console.log(`\n📊 Schedules Fabio aggiornati: ${fabioUpdatedCount}`);
        
        console.log('\n\n🎉 COMPLETATO!');
        
    } catch (error) {
        console.error('❌ Errore:', error);
        throw error;
    }
}

createMissingClosures();
