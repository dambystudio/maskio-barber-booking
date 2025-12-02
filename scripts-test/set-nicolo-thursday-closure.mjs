/**
 * Imposta chiusura ricorrente giovedì per Nicolò
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function setNicoloThursdayClosure() {
    console.log('🔒 IMPOSTAZIONE CHIUSURA RICORRENTE GIOVEDÌ - NICOLÒ\n');
    
    const nicoloEmail = 'giorgiodesa00@gmail.com';
    
    try {
        // 1. Verifica se esiste già una chiusura ricorrente per Nicolò
        const existing = await sql`
            SELECT id, closed_days
            FROM barber_recurring_closures
            WHERE barber_email = ${nicoloEmail}
        `;
        
        if (existing.length > 0) {
            const closedDays = JSON.parse(existing[0].closed_days);
            console.log(`Chiusura ricorrente esistente per Nicolò:`);
            console.log(`   Giorni chiusi attuali: ${closedDays.join(', ')}`);
            
            if (!closedDays.includes(4)) {
                closedDays.push(4);
                await sql`
                    UPDATE barber_recurring_closures
                    SET closed_days = ${JSON.stringify(closedDays)},
                        updated_at = NOW()
                    WHERE id = ${existing[0].id}
                `;
                console.log(`\n✅ Aggiunto giovedì (4) ai giorni chiusi`);
                console.log(`   Nuovi giorni chiusi: ${closedDays.join(', ')}`);
            } else {
                console.log(`\n✅ Giovedì (4) è già nei giorni chiusi`);
            }
        } else {
            // Crea nuova chiusura ricorrente solo per giovedì
            await sql`
                INSERT INTO barber_recurring_closures (
                    barber_email,
                    closed_days,
                    created_by
                ) VALUES (
                    ${nicoloEmail},
                    ${JSON.stringify([4])},
                    'admin'
                )
            `;
            console.log(`✅ Creata nuova chiusura ricorrente per giovedì (4)`);
        }
        
        // 2. Aggiorna tutti gli schedule esistenti per i giovedì futuri
        console.log('\n\n🔄 AGGIORNAMENTO SCHEDULES GIOVEDÌ...\n');
        
        const today = new Date().toISOString().split('T')[0];
        
        const thursdaySchedules = await sql`
            SELECT bs.id, bs.date, bs.available_slots, bs.day_off
            FROM barber_schedules bs
            JOIN barbers b ON bs.barber_id = b.id
            WHERE b.email = ${nicoloEmail}
            AND EXTRACT(DOW FROM bs.date::date) = 4
            AND bs.date >= ${today}
        `;
        
        let updatedCount = 0;
        for (const schedule of thursdaySchedules) {
            const slots = JSON.parse(schedule.available_slots);
            
            if (slots.length > 0 || !schedule.day_off) {
                await sql`
                    UPDATE barber_schedules
                    SET available_slots = '[]',
                        day_off = true,
                        updated_at = NOW()
                    WHERE id = ${schedule.id}
                `;
                updatedCount++;
                console.log(`✅ ${schedule.date}: ${slots.length} → 0 slot (day_off=true)`);
            }
        }
        
        console.log(`\n📊 Schedules giovedì aggiornati: ${updatedCount}`);
        
        // 3. Crea chiusure FULL per tutti i giovedì futuri
        console.log('\n\n🔒 CREAZIONE CHIUSURE FULL GIOVEDÌ...\n');
        
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 60);
        
        let closuresCreated = 0;
        for (let d = new Date(); d <= futureDate; d.setDate(d.getDate() + 1)) {
            if (d.getDay() === 4) { // Giovedì
                const dateString = d.toISOString().split('T')[0];
                
                const existingClosure = await sql`
                    SELECT id FROM barber_closures
                    WHERE barber_email = ${nicoloEmail}
                    AND closure_date = ${dateString}
                    AND closure_type = 'full'
                `;
                
                if (existingClosure.length === 0) {
                    await sql`
                        INSERT INTO barber_closures (
                            barber_email,
                            closure_date,
                            closure_type,
                            reason,
                            created_by
                        ) VALUES (
                            ${nicoloEmail},
                            ${dateString},
                            'full',
                            'Chiusura ricorrente giovedì',
                            'admin'
                        )
                    `;
                    closuresCreated++;
                    console.log(`✅ ${dateString}: Chiusura FULL creata`);
                }
            }
        }
        
        console.log(`\n📊 Chiusure FULL create: ${closuresCreated}`);
        
        // 4. Verifica finale
        console.log('\n\n📊 VERIFICA FINALE:');
        console.log('===================\n');
        
        const recurringClosure = await sql`
            SELECT closed_days, created_by, created_at
            FROM barber_recurring_closures
            WHERE barber_email = ${nicoloEmail}
        `;
        
        if (recurringClosure.length > 0) {
            const closedDays = JSON.parse(recurringClosure[0].closed_days);
            const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
            console.log(`✅ Chiusura ricorrente impostata:`);
            console.log(`   Giorni chiusi: ${closedDays.map(d => dayNames[d]).join(', ')}`);
            console.log(`   Created by: ${recurringClosure[0].created_by}`);
        }
        
        const thursdayCount = await sql`
            SELECT COUNT(*) as count
            FROM barber_schedules bs
            JOIN barbers b ON bs.barber_id = b.id
            WHERE b.email = ${nicoloEmail}
            AND EXTRACT(DOW FROM bs.date::date) = 4
            AND bs.date >= ${today}
            AND day_off = true
        `;
        
        console.log(`\n✅ Schedules giovedì con day_off=true: ${thursdayCount[0].count}`);
        
        const closureCount = await sql`
            SELECT COUNT(*) as count
            FROM barber_closures
            WHERE barber_email = ${nicoloEmail}
            AND EXTRACT(DOW FROM closure_date::date) = 4
            AND closure_date >= ${today}
            AND closure_type = 'full'
        `;
        
        console.log(`✅ Chiusure FULL giovedì: ${closureCount[0].count}`);
        
        console.log('\n\n🎉 COMPLETATO! Nicolò chiuso ogni giovedì.');
        
    } catch (error) {
        console.error('❌ Errore:', error);
        throw error;
    }
}

setNicoloThursdayClosure();
