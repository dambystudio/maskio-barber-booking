import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function cleanWaitlist() {
    console.log('\n🧹 PULIZIA LISTA D\'ATTESA - 22 Dicembre Fabio');
    console.log('='.repeat(80));
    
    try {
        const date = '2025-12-22';
        
        // Check current waitlist
        console.log('\n📋 Liste d\'attesa attuali per 22 dicembre:\n');
        const current = await sql`
            SELECT * FROM waitlist_requests 
            WHERE date = ${date}
            ORDER BY barber_id, created_at
        `;
        
        if (current.length === 0) {
            console.log('   ✅ Nessuna lista d\'attesa trovata');
        } else {
            current.forEach(w => {
                console.log(`   - ${w.customer_name} (${w.customer_email})`);
                console.log(`     Barbiere: ${w.barber_id}`);
                console.log(`     Status: ${w.status}`);
                console.log(`     Creata: ${w.created_at}\n`);
            });
            
            // Delete all waitlist requests for Dec 22 (since both barbers are now open)
            const deleted = await sql`
                DELETE FROM waitlist_requests 
                WHERE date = ${date}
                RETURNING *
            `;
            
            console.log('='.repeat(80));
            console.log(`\n✅ Eliminate ${deleted.length} richieste dalla lista d'attesa`);
            console.log('\n💡 MOTIVO: Sia Fabio che Michele sono ora aperti il 22 dicembre');
            console.log('   I clienti possono prenotare normalmente online!');
        }
        
    } catch (error) {
        console.error('❌ ERRORE:', error);
        throw error;
    }
}

cleanWaitlist()
    .then(() => {
        console.log('\n✅ Pulizia completata\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Pulizia fallita:', error);
        process.exit(1);
    });
