import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function updateWaitlistPhonesFromBookings() {
    console.log('\n🔧 AGGIORNAMENTO TELEFONI WAITLIST DA PRENOTAZIONI\n');
    
    // 1. Trova tutte le entry waitlist senza telefono
    const waitlistWithoutPhone = await sql`
        SELECT id, customer_email, customer_name
        FROM waitlist
        WHERE (customer_phone IS NULL OR customer_phone = '')
        AND customer_email IS NOT NULL
        AND status = 'waiting'
        ORDER BY created_at
    `;
    
    console.log(`📋 Trovate ${waitlistWithoutPhone.length} entry senza telefono\n`);
    
    if (waitlistWithoutPhone.length === 0) {
        console.log('✅ Nessun aggiornamento necessario!\n');
        return;
    }
    
    let updated = 0;
    let notFound = 0;
    
    for (const entry of waitlistWithoutPhone) {
        console.log(`\n🔍 Cerco telefono per: ${entry.customer_name} (${entry.customer_email})`);
        
        // 2. Cerca nelle prenotazioni passate con questa email
        const bookingsWithPhone = await sql`
            SELECT customer_phone, date, time
            FROM bookings
            WHERE customer_email = ${entry.customer_email}
            AND customer_phone IS NOT NULL
            AND customer_phone != ''
            ORDER BY date DESC, time DESC
            LIMIT 1
        `;
        
        if (bookingsWithPhone.length > 0) {
            const phone = bookingsWithPhone[0].customer_phone;
            console.log(`   ✅ Trovato telefono: ${phone}`);
            console.log(`      (dalla prenotazione del ${bookingsWithPhone[0].date} alle ${bookingsWithPhone[0].time})`);
            
            // 3. Aggiorna la waitlist
            await sql`
                UPDATE waitlist
                SET customer_phone = ${phone},
                    updated_at = NOW()
                WHERE id = ${entry.id}
            `;
            
            updated++;
        } else {
            console.log(`   ❌ Nessun telefono trovato nelle prenotazioni passate`);
            notFound++;
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RIEPILOGO:');
    console.log('='.repeat(60));
    console.log(`   Totale entry senza telefono: ${waitlistWithoutPhone.length}`);
    console.log(`   ✅ Aggiornate con successo: ${updated}`);
    console.log(`   ❌ Telefono non trovato: ${notFound}`);
    console.log('='.repeat(60) + '\n');
    
    if (updated > 0) {
        console.log('✨ Aggiornamenti completati!\n');
        
        // Mostra un esempio delle entry aggiornate
        const updatedEntries = await sql`
            SELECT customer_name, customer_email, customer_phone, date
            FROM waitlist
            WHERE id = ANY(${waitlistWithoutPhone.slice(0, 5).map(e => e.id)})
        `;
        
        console.log('📋 Esempio entry aggiornate:');
        updatedEntries.forEach((e, i) => {
            console.log(`   ${i + 1}. ${e.customer_name} - ${e.customer_phone || 'ancora senza telefono'}`);
        });
        console.log('');
    }
    
    process.exit(0);
}

updateWaitlistPhonesFromBookings().catch(error => {
    console.error('❌ ERRORE:', error);
    process.exit(1);
});
