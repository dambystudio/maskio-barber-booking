/**
 * Override chiusure automatiche per 29 dicembre e 5 gennaio
 * Tutti i barbieri aperti tutto il giorno (anche se lunedì)
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function overrideMondayClosures() {
    console.log('🔓 OVERRIDE CHIUSURE AUTOMATICHE LUNEDÌ\n');
    
    const barbers = [
        { email: 'michelebiancofiore0230@gmail.com', name: 'Michele' },
        { email: 'fabio.cassano97@icloud.com', name: 'Fabio' },
        { email: 'giorgiodesa00@gmail.com', name: 'Nicolò' }
    ];
    
    const specialMondays = [
        { date: '2025-12-29', reason: 'Apertura eccezionale periodo natalizio' },
        { date: '2026-01-05', reason: 'Apertura eccezionale inizio anno' }
    ];
    
    try {
        for (const monday of specialMondays) {
            console.log(`\n📅 ${monday.date} - ${monday.reason}`);
            console.log('─'.repeat(60));
            
            for (const barber of barbers) {
                // 1. Trova e rimuovi chiusure per questo lunedì
                const closures = await sql`
                    SELECT id, closure_type, created_by
                    FROM barber_closures
                    WHERE barber_email = ${barber.email}
                    AND closure_date = ${monday.date}
                `;
                
                for (const closure of closures) {
                    // Rimuovi la chiusura
                    await sql`
                        DELETE FROM barber_closures
                        WHERE id = ${closure.id}
                    `;
                    
                    // Se era automatica, registra la rimozione manuale
                    if (closure.created_by === 'system-auto' || closure.created_by === 'system') {
                        await sql`
                            INSERT INTO barber_removed_auto_closures (
                                barber_email,
                                closure_date,
                                closure_type,
                                removed_by,
                                reason
                            ) VALUES (
                                ${barber.email},
                                ${monday.date},
                                ${closure.closure_type},
                                'admin',
                                ${monday.reason}
                            )
                            ON CONFLICT (barber_email, closure_date, closure_type) DO NOTHING
                        `;
                        console.log(`   ✅ ${barber.name}: Rimossa chiusura ${closure.closure_type} (${closure.created_by}) + registrato override`);
                    } else {
                        console.log(`   ✅ ${barber.name}: Rimossa chiusura ${closure.closure_type} (${closure.created_by})`);
                    }
                }
                
                if (closures.length === 0) {
                    console.log(`   ℹ️  ${barber.name}: Nessuna chiusura da rimuovere`);
                }
                
                // 2. Aggiorna lo schedule per avere tutti gli slot
                const schedule = await sql`
                    SELECT bs.id, bs.available_slots
                    FROM barber_schedules bs
                    JOIN barbers b ON bs.barber_id = b.id
                    WHERE b.email = ${barber.email}
                    AND bs.date = ${monday.date}
                `;
                
                if (schedule.length > 0) {
                    const currentSlots = JSON.parse(schedule[0].available_slots);
                    // Lunedì completo: 15 slot (09:00-18:00)
                    const fullMondaySlots = [
                        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
                        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
                    ];
                    
                    if (JSON.stringify(currentSlots) !== JSON.stringify(fullMondaySlots)) {
                        await sql`
                            UPDATE barber_schedules
                            SET available_slots = ${JSON.stringify(fullMondaySlots)},
                                day_off = false
                            WHERE id = ${schedule[0].id}
                        `;
                        console.log(`   ✅ ${barber.name}: Schedule aggiornato ${currentSlots.length} → 15 slot`);
                    } else {
                        console.log(`   ✅ ${barber.name}: Schedule già completo (15 slot)`);
                    }
                } else {
                    console.log(`   ⚠️  ${barber.name}: Schedule non trovato`);
                }
            }
        }
        
        console.log('\n\n📊 VERIFICA FINALE:');
        console.log('===================\n');
        
        for (const monday of specialMondays) {
            console.log(`\n📅 ${monday.date}:`);
            
            // Conta chiusure rimaste
            const closures = await sql`
                SELECT COUNT(*) as count
                FROM barber_closures
                WHERE closure_date = ${monday.date}
            `;
            
            // Conta slot per barbiere
            const schedules = await sql`
                SELECT b.name, bs.available_slots, bs.day_off
                FROM barber_schedules bs
                JOIN barbers b ON bs.barber_id = b.id
                WHERE bs.date = ${monday.date}
                ORDER BY b.name
            `;
            
            if (closures[0].count > 0) {
                console.log(`   ⚠️ Chiusure ancora presenti: ${closures[0].count}`);
            } else {
                console.log(`   ✅ Nessuna chiusura presente`);
            }
            
            for (const schedule of schedules) {
                const slots = JSON.parse(schedule.available_slots);
                const status = slots.length === 15 ? '✅' : '⚠️';
                console.log(`   ${status} ${schedule.name}: ${slots.length} slot${schedule.day_off ? ' (day_off)' : ''}`);
            }
        }
        
        // Verifica che gli override siano registrati
        console.log('\n\n🔍 OVERRIDE REGISTRATI:');
        console.log('========================\n');
        
        const overrides = await sql`
            SELECT barber_email, closure_date, closure_type, removed_by, reason
            FROM barber_removed_auto_closures
            WHERE closure_date IN ('2025-12-29', '2026-01-05')
            ORDER BY closure_date, barber_email
        `;
        
        if (overrides.length > 0) {
            for (const override of overrides) {
                const barberName = barbers.find(b => b.email === override.barber_email)?.name || 'Sconosciuto';
                console.log(`✅ ${barberName} - ${override.closure_date}: ${override.closure_type}`);
                console.log(`   Motivo: ${override.reason}`);
                console.log(`   Rimossa da: ${override.removed_by}\n`);
            }
        } else {
            console.log('ℹ️  Nessun override registrato');
        }
        
        console.log('\n🎉 COMPLETATO! I lunedì 29/12 e 5/1 sono ora aperti tutto il giorno per tutti.');
        
    } catch (error) {
        console.error('❌ Errore:', error);
        throw error;
    }
}

overrideMondayClosures();
