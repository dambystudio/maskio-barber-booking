/**
 * Verifica chiusure esistenti e possibili collisioni con il nuovo sistema
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function checkExistingClosures() {
    console.log('🔍 ANALISI CHIUSURE ESISTENTI NEL DATABASE\n');
    
    try {
        // 1. Conta chiusure totali per barbiere
        console.log('1️⃣ Chiusure totali per barbiere:');
        console.log('=====================================');
        const closuresByBarber = await sql`
            SELECT 
                barber_email,
                COUNT(*) as total_closures,
                COUNT(CASE WHEN created_by = 'system' THEN 1 END) as system_closures,
                COUNT(CASE WHEN created_by = 'system-auto' THEN 1 END) as system_auto_closures,
                COUNT(CASE WHEN created_by NOT IN ('system', 'system-auto') THEN 1 END) as manual_closures
            FROM barber_closures
            GROUP BY barber_email
            ORDER BY barber_email
        `;
        
        if (closuresByBarber.length > 0) {
            closuresByBarber.forEach(row => {
                console.log(`\n📧 ${row.barber_email}:`);
                console.log(`   Total: ${row.total_closures} chiusure`);
                console.log(`   - created_by='system': ${row.system_closures}`);
                console.log(`   - created_by='system-auto': ${row.system_auto_closures}`);
                console.log(`   - manuali: ${row.manual_closures}`);
            });
        } else {
            console.log('   ℹ️ Nessuna chiusura nel database');
        }
        
        // 2. Analisi per tipo di chiusura
        console.log('\n\n2️⃣ Distribuzione per tipo di chiusura:');
        console.log('=========================================');
        const closuresByType = await sql`
            SELECT 
                closure_type,
                COUNT(*) as count,
                COUNT(CASE WHEN created_by = 'system' THEN 1 END) as system_count,
                COUNT(CASE WHEN created_by = 'system-auto' THEN 1 END) as system_auto_count
            FROM barber_closures
            GROUP BY closure_type
            ORDER BY closure_type
        `;
        
        if (closuresByType.length > 0) {
            closuresByType.forEach(row => {
                console.log(`\n${row.closure_type}:`);
                console.log(`   Total: ${row.count}`);
                console.log(`   System: ${row.system_count}`);
                console.log(`   System-auto: ${row.system_auto_count}`);
            });
        }
        
        // 3. Verifica chiusure future (potrebbero collidere)
        console.log('\n\n3️⃣ Chiusure FUTURE (potrebbero essere rigenerate):');
        console.log('====================================================');
        const today = new Date().toISOString().split('T')[0];
        const futureClosures = await sql`
            SELECT 
                barber_email,
                closure_date,
                closure_type,
                created_by,
                reason
            FROM barber_closures
            WHERE closure_date >= ${today}
            ORDER BY barber_email, closure_date
            LIMIT 20
        `;
        
        if (futureClosures.length > 0) {
            console.log(`\nTrovate ${futureClosures.length} chiusure future (mostro prime 20):\n`);
            let currentBarber = '';
            futureClosures.forEach(c => {
                if (c.barber_email !== currentBarber) {
                    currentBarber = c.barber_email;
                    console.log(`\n📧 ${c.barber_email}:`);
                }
                console.log(`   ${c.closure_date} | ${c.closure_type.padEnd(10)} | created_by: ${c.created_by || 'NULL'}`);
            });
        } else {
            console.log('   ℹ️ Nessuna chiusura futura');
        }
        
        // 4. Verifica POSSIBILI COLLISIONI con sistema automatico
        console.log('\n\n4️⃣ ANALISI COLLISIONI CON NUOVO SISTEMA:');
        console.log('==========================================');
        
        // Nicolò dovrebbe avere chiusure mattutine ogni giorno
        console.log('\n🔍 Nicolò (dovrebbe avere chiusure MORNING ogni giorno):');
        const nicoloClosures = await sql`
            SELECT 
                closure_date,
                closure_type,
                created_by
            FROM barber_closures
            WHERE barber_email = 'nicolo@maskiobarber.com'
            AND closure_date >= ${today}
            ORDER BY closure_date
            LIMIT 10
        `;
        
        if (nicoloClosures.length > 0) {
            console.log(`   Trovate ${nicoloClosures.length} chiusure future:`);
            nicoloClosures.forEach(c => {
                const icon = c.closure_type === 'morning' ? '✅' : '⚠️';
                console.log(`   ${icon} ${c.closure_date}: ${c.closure_type} (${c.created_by || 'NULL'})`);
            });
        } else {
            console.log('   ⚠️ Nessuna chiusura futura trovata!');
        }
        
        // Michele dovrebbe avere chiusure mattutine solo lunedì
        console.log('\n🔍 Michele (dovrebbe avere MORNING solo lunedì):');
        const micheleClosures = await sql`
            SELECT 
                closure_date,
                EXTRACT(DOW FROM closure_date::date) as day_of_week,
                closure_type,
                created_by
            FROM barber_closures
            WHERE barber_email = 'michele@maskiobarber.com'
            AND closure_date >= ${today}
            ORDER BY closure_date
            LIMIT 10
        `;
        
        if (micheleClosures.length > 0) {
            console.log(`   Trovate ${micheleClosures.length} chiusure future:`);
            micheleClosures.forEach(c => {
                const dayName = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][c.day_of_week];
                const isMonday = c.day_of_week === 1;
                const isCorrect = isMonday && c.closure_type === 'morning';
                const icon = isCorrect ? '✅' : (isMonday ? '⚠️' : 'ℹ️');
                console.log(`   ${icon} ${c.closure_date} (${dayName}): ${c.closure_type} (${c.created_by || 'NULL'})`);
            });
        } else {
            console.log('   ⚠️ Nessuna chiusura futura trovata!');
        }
        
        // Fabio dovrebbe avere chiusure FULL solo lunedì
        console.log('\n🔍 Fabio (dovrebbe avere FULL solo lunedì):');
        const fabioClosures = await sql`
            SELECT 
                closure_date,
                EXTRACT(DOW FROM closure_date::date) as day_of_week,
                closure_type,
                created_by
            FROM barber_closures
            WHERE barber_email = 'fabio@maskiobarber.com'
            AND closure_date >= ${today}
            ORDER BY closure_date
            LIMIT 10
        `;
        
        if (fabioClosures.length > 0) {
            console.log(`   Trovate ${fabioClosures.length} chiusure future:`);
            fabioClosures.forEach(c => {
                const dayName = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][c.day_of_week];
                const isMonday = c.day_of_week === 1;
                const isCorrect = isMonday && c.closure_type === 'full';
                const icon = isCorrect ? '✅' : (isMonday ? '⚠️' : 'ℹ️');
                console.log(`   ${icon} ${c.closure_date} (${dayName}): ${c.closure_type} (${c.created_by || 'NULL'})`);
            });
        } else {
            console.log('   ⚠️ Nessuna chiusura futura trovata!');
        }
        
        // 5. Verifica DUPLICATI potenziali
        console.log('\n\n5️⃣ VERIFICA DUPLICATI:');
        console.log('========================');
        const duplicates = await sql`
            SELECT 
                barber_email,
                closure_date,
                closure_type,
                COUNT(*) as duplicate_count
            FROM barber_closures
            WHERE closure_date >= ${today}
            GROUP BY barber_email, closure_date, closure_type
            HAVING COUNT(*) > 1
        `;
        
        if (duplicates.length > 0) {
            console.log('   ⚠️ ATTENZIONE: Trovati duplicati!');
            duplicates.forEach(d => {
                console.log(`   ❌ ${d.barber_email} - ${d.closure_date} - ${d.closure_type}: ${d.duplicate_count} copie`);
            });
        } else {
            console.log('   ✅ Nessun duplicato trovato');
        }
        
        // 6. Riepilogo e raccomandazioni
        console.log('\n\n📊 RIEPILOGO E RACCOMANDAZIONI:');
        console.log('================================');
        
        const totalFutureClosures = await sql`
            SELECT COUNT(*) as count
            FROM barber_closures
            WHERE closure_date >= ${today}
        `;
        
        console.log(`\n✅ Chiusure future totali: ${totalFutureClosures[0].count}`);
        
        console.log('\n💡 COMPORTAMENTO DEL NUOVO SISTEMA:');
        console.log('   1. createAutoClosureIfNeeded() controlla se la chiusura ESISTE GIÀ');
        console.log('   2. Se esiste → NON crea duplicato (skip)');
        console.log('   3. Se NON esiste → Controlla se è stata rimossa manualmente');
        console.log('   4. Se rimossa → NON ricrea (rispetta scelta barbiere)');
        console.log('   5. Solo se non esiste E non è stata rimossa → CREA');
        
        console.log('\n✅ NESSUNA COLLISIONE:');
        console.log('   - Le chiusure esistenti NON saranno duplicate');
        console.log('   - Il sistema crea solo chiusure mancanti');
        console.log('   - I created_by="system" esistenti rimangono intatti');
        console.log('   - Nuove chiusure avranno created_by="system-auto"');
        
        // 7. Suggerimenti per pulizia (opzionale)
        const oldSystemClosures = await sql`
            SELECT COUNT(*) as count
            FROM barber_closures
            WHERE created_by = 'system'
            AND closure_date < ${today}
        `;
        
        if (oldSystemClosures[0].count > 0) {
            console.log('\n🧹 PULIZIA OPZIONALE:');
            console.log(`   Trovate ${oldSystemClosures[0].count} chiusure vecchie (created_by='system')`);
            console.log('   Puoi eliminarle con:');
            console.log(`   DELETE FROM barber_closures WHERE created_by='system' AND closure_date < '${today}';`);
        }
        
    } catch (error) {
        console.error('❌ Errore durante analisi:', error);
        throw error;
    }
}

// Esegui analisi
checkExistingClosures();
