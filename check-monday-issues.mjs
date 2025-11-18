/**
 * Verifica problemi Michele e Fabio - chiusure lunedì
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function checkMondayIssues() {
    console.log('🔍 ANALISI PROBLEMI LUNEDÌ - MICHELE E FABIO\n');
    
    try {
        // 1. Verifica chiusure Michele lunedì (dovrebbe avere MORNING)
        console.log('1️⃣ MICHELE - Chiusure Lunedì (dovrebbe avere MORNING)');
        console.log('=======================================================');
        
        const today = new Date().toISOString().split('T')[0];
        
        const micheleClosures = await sql`
            SELECT 
                closure_date,
                EXTRACT(DOW FROM closure_date::date) as day_of_week,
                closure_type,
                created_by,
                reason
            FROM barber_closures
            WHERE barber_email = 'michelebiancofiore0230@gmail.com'
            AND EXTRACT(DOW FROM closure_date::date) = 1
            AND closure_date >= ${today}
            ORDER BY closure_date
            LIMIT 10
        `;
        
        if (micheleClosures.length > 0) {
            console.log(`\nTrovate ${micheleClosures.length} chiusure lunedì per Michele:\n`);
            micheleClosures.forEach(c => {
                const status = c.closure_type === 'morning' ? '✅' : '❌';
                console.log(`${status} ${c.closure_date}: ${c.closure_type.toUpperCase()} (${c.created_by})`);
            });
        } else {
            console.log('❌ PROBLEMA: Nessuna chiusura lunedì trovata per Michele!');
        }
        
        // 2. Verifica schedules Michele lunedì
        console.log('\n\n2️⃣ MICHELE - Schedules Lunedì');
        console.log('================================');
        
        const micheleSchedules = await sql`
            SELECT 
                bs.date,
                EXTRACT(DOW FROM bs.date::date) as day_of_week,
                bs.available_slots,
                bs.day_off,
                b.name
            FROM barber_schedules bs
            JOIN barbers b ON bs.barber_id = b.id
            WHERE b.email = 'michelebiancofiore0230@gmail.com'
            AND EXTRACT(DOW FROM bs.date::date) = 1
            AND bs.date >= ${today}
            ORDER BY bs.date
            LIMIT 5
        `;
        
        if (micheleSchedules.length > 0) {
            micheleSchedules.forEach(s => {
                const slots = JSON.parse(s.available_slots);
                const hasMorningSlots = slots.some(slot => {
                    const hour = parseInt(slot.split(':')[0]);
                    return hour < 14;
                });
                const status = hasMorningSlots ? '❌ HA SLOT MATTINA!' : '✅ Solo pomeriggio';
                console.log(`\n${status} ${s.date}:`);
                console.log(`   Total slots: ${slots.length}`);
                console.log(`   Slots: ${slots.join(', ')}`);
                console.log(`   Day off: ${s.day_off}`);
            });
        } else {
            console.log('⚠️ Nessuno schedule trovato per Michele lunedì');
        }
        
        // 3. Verifica chiusure Fabio lunedì (dovrebbe avere FULL)
        console.log('\n\n3️⃣ FABIO - Chiusure Lunedì (dovrebbe avere FULL)');
        console.log('====================================================');
        
        const fabioClosures = await sql`
            SELECT 
                closure_date,
                EXTRACT(DOW FROM closure_date::date) as day_of_week,
                closure_type,
                created_by,
                reason
            FROM barber_closures
            WHERE barber_email = 'fabio.cassano97@icloud.com'
            AND EXTRACT(DOW FROM closure_date::date) = 1
            AND closure_date >= ${today}
            ORDER BY closure_date
            LIMIT 10
        `;
        
        if (fabioClosures.length > 0) {
            console.log(`\nTrovate ${fabioClosures.length} chiusure lunedì per Fabio:\n`);
            fabioClosures.forEach(c => {
                const status = c.closure_type === 'full' ? '✅' : '❌';
                console.log(`${status} ${c.closure_date}: ${c.closure_type.toUpperCase()} (${c.created_by})`);
            });
        } else {
            console.log('❌ PROBLEMA: Nessuna chiusura lunedì trovata per Fabio!');
        }
        
        // 4. Verifica schedules Fabio lunedì gennaio
        console.log('\n\n4️⃣ FABIO - Schedules Lunedì Gennaio 2026');
        console.log('===========================================');
        
        const fabioSchedules = await sql`
            SELECT 
                bs.date,
                EXTRACT(DOW FROM bs.date::date) as day_of_week,
                bs.available_slots,
                bs.day_off,
                b.name
            FROM barber_schedules bs
            JOIN barbers b ON bs.barber_id = b.id
            WHERE b.email = 'fabio.cassano97@icloud.com'
            AND EXTRACT(DOW FROM bs.date::date) = 1
            AND bs.date >= '2026-01-01'
            AND bs.date < '2026-02-01'
            ORDER BY bs.date
        `;
        
        if (fabioSchedules.length > 0) {
            fabioSchedules.forEach(s => {
                const slots = JSON.parse(s.available_slots);
                const status = slots.length === 0 ? '✅ Chiuso' : `❌ APERTO (${slots.length} slots)`;
                console.log(`\n${status} ${s.date}:`);
                console.log(`   Slots: ${slots.join(', ') || 'NESSUNO'}`);
                console.log(`   Day off: ${s.day_off}`);
            });
        } else {
            console.log('⚠️ Nessuno schedule trovato per Fabio gennaio 2026');
        }
        
        // 5. Verifica se esistono chiusure manuali che potrebbero interferire
        console.log('\n\n5️⃣ CHIUSURE RIMOSSE MANUALMENTE');
        console.log('==================================');
        
        const removedClosures = await sql`
            SELECT 
                barber_email,
                closure_date,
                closure_type,
                removed_by,
                removed_at,
                reason
            FROM barber_removed_auto_closures
            WHERE (barber_email = 'michelebiancofiore0230@gmail.com' 
                   OR barber_email = 'fabio.cassano97@icloud.com')
            AND closure_date >= ${today}
            ORDER BY barber_email, closure_date
        `;
        
        if (removedClosures.length > 0) {
            console.log(`\n⚠️ Trovate ${removedClosures.length} chiusure rimosse manualmente:\n`);
            removedClosures.forEach(r => {
                const barberName = r.barber_email.includes('michele') ? 'Michele' : 
                                   r.barber_email.includes('fabio') ? 'Fabio' : 'Altro';
                console.log(`${barberName} - ${r.closure_date}: ${r.closure_type}`);
                console.log(`   Rimossa da: ${r.removed_by}`);
                console.log(`   Motivo: ${r.reason || 'N/A'}\n`);
            });
        } else {
            console.log('✅ Nessuna chiusura rimossa manualmente');
        }
        
        // 6. Riepilogo problemi
        console.log('\n\n📊 RIEPILOGO PROBLEMI');
        console.log('======================\n');
        
        console.log('MICHELE (lunedì mattina aperta):');
        if (micheleClosures.length === 0) {
            console.log('❌ Mancano chiusure MORNING per lunedì');
            console.log('   Causa: daily-update non ha creato le chiusure automatiche');
        } else {
            const wrongType = micheleClosures.filter(c => c.closure_type !== 'morning');
            if (wrongType.length > 0) {
                console.log('❌ Chiusure presenti ma tipo sbagliato');
            } else {
                console.log('⚠️ Chiusure presenti ma schedules hanno ancora slot mattutini');
                console.log('   Causa: Gli slot potrebbero non essere filtrati correttamente');
            }
        }
        
        console.log('\nFABIO (lunedì gennaio aperto):');
        if (fabioClosures.length === 0) {
            console.log('❌ Mancano chiusure FULL per lunedì');
            console.log('   Causa: daily-update non ha creato le chiusure automatiche');
        } else {
            const januaryClosures = fabioClosures.filter(c => c.closure_date.startsWith('2026-01'));
            if (januaryClosures.length === 0) {
                console.log('❌ Mancano chiusure per gennaio 2026');
                console.log('   Causa: daily-update copre solo 60 giorni dal '+ new Date().toISOString().split('T')[0]);
            }
        }
        
    } catch (error) {
        console.error('❌ Errore durante analisi:', error);
        throw error;
    }
}

checkMondayIssues();
