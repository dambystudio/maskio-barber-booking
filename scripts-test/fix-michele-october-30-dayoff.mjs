import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixMicheleOctober30() {
    const date = '2025-10-30';
    const micheleEmail = 'michelebiancofiore0230@gmail.com';
    
    console.log(`\n🔧 FIX: Imposta day_off=false per Michele il ${date}`);
    
    try {
        const michele = await sql`SELECT id FROM barbers WHERE email = ${micheleEmail}`;
        
        if (michele.length === 0) {
            console.log('❌ Michele non trovato');
            return;
        }
        
        const micheleId = michele[0].id;
        
        // Aggiorna schedule impostando day_off=false
        await sql`
            UPDATE barber_schedules 
            SET day_off = false,
                updated_at = NOW()
            WHERE barber_id = ${micheleId} AND date = ${date}
        `;
        
        console.log('✅ day_off impostato a FALSE');
        
        // Verifica
        const updated = await sql`
            SELECT * FROM barber_schedules 
            WHERE barber_id = ${micheleId} AND date = ${date}
        `;
        
        console.log('\n📊 Verifica:');
        console.log(`   day_off: ${updated[0].day_off}`);
        console.log(`   available_slots: ${updated[0].available_slots}`);
        console.log(`   Numero slot: ${JSON.parse(updated[0].available_slots).length}`);
        
        console.log('\n✅ Michele ora è APERTO il 30 ottobre!');
        
    } catch (error) {
        console.error('❌ ERRORE:', error);
        throw error;
    }
}

fixMicheleOctober30()
    .then(() => {
        console.log('\n✅ Fix completato');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Fix fallito:', error);
        process.exit(1);
    });
