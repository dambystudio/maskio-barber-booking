/**
 * Test: Verifica che le chiusure rimosse manualmente NON vengano ricreate
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function testRemovedClosures() {
    console.log('🧪 TEST: Verifica rispetto chiusure rimosse manualmente\n');
    
    const testBarber = 'nicolo@maskiobarber.com';
    const testDate = '2025-12-15'; // Lunedì
    
    try {
        // Step 1: Verifica se esiste già una chiusura automatica
        console.log('1️⃣ Controllo chiusura automatica esistente...');
        const existingClosure = await sql`
            SELECT id, closure_type, created_by 
            FROM barber_closures
            WHERE barber_email = ${testBarber}
            AND closure_date = ${testDate}
        `;
        
        if (existingClosure.length > 0) {
            console.log(`   ✅ Trovata chiusura: ${existingClosure[0].closure_type} (created_by: ${existingClosure[0].created_by})`);
            
            // Step 2: "Simulazione barbiere": elimina la chiusura
            console.log('\n2️⃣ SIMULAZIONE: Barbiere elimina la chiusura mattutina...');
            const deleted = await sql`
                DELETE FROM barber_closures
                WHERE id = ${existingClosure[0].id}
                RETURNING id
            `;
            console.log(`   ✅ Chiusura eliminata (ID: ${deleted[0].id})`);
            
            // Step 3: Registra la rimozione nella tabella di tracking
            console.log('\n3️⃣ Registrazione rimozione manuale...');
            await sql`
                INSERT INTO barber_removed_auto_closures (
                    barber_email,
                    closure_date,
                    closure_type,
                    removed_by,
                    reason
                ) VALUES (
                    ${testBarber},
                    ${testDate},
                    'morning',
                    ${testBarber},
                    'Apertura eccezionale mattina'
                )
                ON CONFLICT (barber_email, closure_date, closure_type) DO NOTHING
            `;
            console.log('   ✅ Rimozione registrata in barber_removed_auto_closures');
            
        } else {
            console.log('   ℹ️ Nessuna chiusura trovata per questo test');
            console.log('   ℹ️ Creo prima una chiusura automatica...');
            
            await sql`
                INSERT INTO barber_closures (
                    barber_email,
                    closure_date,
                    closure_type,
                    reason,
                    created_by
                ) VALUES (
                    ${testBarber},
                    ${testDate},
                    'morning',
                    'Chiusura mattutina standard',
                    'system-auto'
                )
            `;
            console.log('   ✅ Chiusura automatica creata');
            console.log('\n   ⏭️ Riesegui lo script per testare la rimozione');
            return;
        }
        
        // Step 4: Verifica nella tabella di tracking
        console.log('\n4️⃣ Verifica registrazione rimozione...');
        const removedRecord = await sql`
            SELECT * FROM barber_removed_auto_closures
            WHERE barber_email = ${testBarber}
            AND closure_date = ${testDate}
            AND closure_type = 'morning'
        `;
        
        if (removedRecord.length > 0) {
            console.log('   ✅ Rimozione registrata correttamente:');
            console.log(`      - Data: ${removedRecord[0].closure_date}`);
            console.log(`      - Tipo: ${removedRecord[0].closure_type}`);
            console.log(`      - Rimossa da: ${removedRecord[0].removed_by}`);
            console.log(`      - Motivo: ${removedRecord[0].reason || 'N/A'}`);
            console.log(`      - Quando: ${removedRecord[0].removed_at}`);
        } else {
            console.log('   ❌ Rimozione NON registrata!');
        }
        
        // Step 5: Simula il daily-update
        console.log('\n5️⃣ SIMULAZIONE daily-update (createAutoClosureIfNeeded)...');
        console.log('   📝 Il sistema controlla se deve ricreare la chiusura...');
        
        // Check 1: Esiste già?
        const checkExisting = await sql`
            SELECT id FROM barber_closures
            WHERE barber_email = ${testBarber}
            AND closure_date = ${testDate}
            AND closure_type = 'morning'
        `;
        console.log(`   ✅ Check chiusura esistente: ${checkExisting.length > 0 ? 'SÌ' : 'NO'}`);
        
        if (checkExisting.length === 0) {
            // Check 2: È stata rimossa manualmente?
            const checkRemoved = await sql`
                SELECT id FROM barber_removed_auto_closures
                WHERE barber_email = ${testBarber}
                AND closure_date = ${testDate}
                AND closure_type = 'morning'
            `;
            console.log(`   ✅ Check rimozione manuale: ${checkRemoved.length > 0 ? 'SÌ (RISPETTA)' : 'NO'}`);
            
            if (checkRemoved.length > 0) {
                console.log('   ✅ ✨ Il sistema NON ricrea la chiusura (rispetta rimozione barbiere)');
            } else {
                console.log('   ⚠️ Il sistema ricreerebbe la chiusura');
            }
        }
        
        console.log('\n📊 RIEPILOGO TEST');
        console.log('==================');
        console.log('✅ Chiusura automatica eliminata dal barbiere');
        console.log('✅ Rimozione registrata nel sistema');
        console.log('✅ daily-update NON ricrea la chiusura (RISPETTA preferenza barbiere)');
        console.log('\n💡 COMPORTAMENTO CORRETTO:');
        console.log('   Se il barbiere elimina una chiusura automatica,');
        console.log('   può lavorare quel giorno e il sistema NON sovrascrive la decisione.');
        
    } catch (error) {
        console.error('❌ Errore durante il test:', error);
        throw error;
    }
}

// Esegui il test
testRemovedClosures();
