/**
 * Trigger manual daily-update per creare chiusure automatiche
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function triggerDailyUpdate() {
    console.log('🚀 TRIGGER DAILY-UPDATE MANUALE\n');
    
    try {
        console.log('Chiamata API daily-update in corso...\n');
        
        const response = await fetch('https://www.maskiobarberconcept.it/api/system/daily-update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Errore HTTP:', response.status);
            console.error('Risposta:', errorText);
            return;
        }
        
        const data = await response.json();
        console.log('✅ Daily-update completato con successo!\n');
        console.log('📊 Statistiche:');
        console.log(JSON.stringify(data, null, 2));
        
        // Dopo il daily-update, verifica le chiusure create
        console.log('\n\n🔍 Verifica chiusure create...\n');
        
        const micheleClosures = await sql`
            SELECT COUNT(*) as count
            FROM barber_closures
            WHERE barber_email = 'michelebiancofiore0230@gmail.com'
            AND EXTRACT(DOW FROM closure_date::date) = 1
            AND closure_type = 'morning'
            AND created_by = 'system-auto'
        `;
        
        const fabioClosures = await sql`
            SELECT COUNT(*) as count
            FROM barber_closures
            WHERE barber_email = 'fabio.cassano97@icloud.com'
            AND EXTRACT(DOW FROM closure_date::date) = 1
            AND closure_type = 'full'
            AND created_by = 'system-auto'
        `;
        
        console.log(`Michele - Chiusure MORNING lunedì (system-auto): ${micheleClosures[0].count}`);
        console.log(`Fabio - Chiusure FULL lunedì (system-auto): ${fabioClosures[0].count}`);
        
    } catch (error) {
        console.error('❌ Errore:', error);
    }
}

triggerDailyUpdate();
