import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function deleteAllExceptionalOpenings() {
    console.log('\n🗑️  Eliminazione Aperture Eccezionali');
    console.log('='.repeat(70));
    
    try {
        // 1. Trova tutti gli schedule futuri con day_off=false in giorni chiusi per chiusura ricorrente
        const today = new Date().toISOString().split('T')[0];
        
        console.log('\n1️⃣ Cerca aperture eccezionali...');
        
        const schedules = await sql`
            SELECT bs.id, bs.date, bs.barber_id, b.name as barber_name, b.email as barber_email, bs.day_off
            FROM barber_schedules bs
            JOIN barbers b ON bs.barber_id = b.id
            WHERE bs.date >= ${today}
            AND bs.day_off = false
            ORDER BY bs.date
        `;
        
        console.log(`   Trovati ${schedules.length} schedule aperti nel futuro`);
        
        // 2. Per ogni schedule, verifica se è un'apertura eccezionale
        const exceptionsToDelete = [];
        
        for (const schedule of schedules) {
            const dateObj = new Date(schedule.date + 'T00:00:00');
            const dayOfWeek = dateObj.getDay();
            
            // Verifica chiusure ricorrenti per questo barbiere
            const recurringClosures = await sql`
                SELECT closed_days FROM barber_recurring_closures
                WHERE barber_email = ${schedule.barber_email}
            `;
            
            if (recurringClosures.length > 0) {
                const closedDays = JSON.parse(recurringClosures[0].closed_days);
                if (closedDays.includes(dayOfWeek)) {
                    // Questo è un'apertura eccezionale!
                    exceptionsToDelete.push(schedule);
                }
            }
        }
        
        console.log(`\n2️⃣ Trovate ${exceptionsToDelete.length} aperture eccezionali:`);
        
        if (exceptionsToDelete.length === 0) {
            console.log('   ✅ Nessuna apertura eccezionale da eliminare');
            return;
        }
        
        exceptionsToDelete.forEach(exc => {
            const dateObj = new Date(exc.date + 'T00:00:00');
            const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
            const dayName = dayNames[dateObj.getDay()];
            console.log(`   - ${exc.date} (${dayName}) - ${exc.barber_name}`);
        });
        
        // 3. Elimina tutte le aperture eccezionali
        console.log('\n3️⃣ Eliminazione in corso...');
        
        for (const exception of exceptionsToDelete) {
            await sql`
                UPDATE barber_schedules
                SET day_off = true,
                    available_slots = '[]',
                    updated_at = NOW()
                WHERE id = ${exception.id}
            `;
            console.log(`   ✅ ${exception.barber_name} - ${exception.date}: riportato a day_off=true`);
        }
        
        console.log(`\n✅ ${exceptionsToDelete.length} aperture eccezionali eliminate!`);
        console.log('   Tutti i giorni sono tornati alle impostazioni di chiusura ricorrente.');
        
    } catch (error) {
        console.error('\n❌ ERRORE:', error);
        throw error;
    }
}

deleteAllExceptionalOpenings()
    .then(() => {
        console.log('\n✅ Operazione completata');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Operazione fallita:', error);
        process.exit(1);
    });
