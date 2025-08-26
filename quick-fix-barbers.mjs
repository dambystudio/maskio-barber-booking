import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function quickFixBarberBookings() {
    console.log('🔧 Quick fix per prenotazioni barbieri...');
    
    try {
        // 1. Trova user IDs dei barbieri tramite email
        const barberEmails = ['fabio.cassano97@icloud.com', 'michelebiancofiore0230@gmail.com', 'marcocis2006@gmail.com'];
        
        const barberUsers = await sql`
            SELECT id, email 
            FROM users 
            WHERE email = ANY(${barberEmails})
        `;
        
        console.log('👤 Barbieri trovati:');
        barberUsers.forEach(user => {
            console.log(`   ${user.email}: ${user.id}`);
        });
        
        if (barberUsers.length === 0) {
            console.log('❌ Nessun barbiere trovato');
            return;
        }
        
        const barberUserIds = barberUsers.map(u => u.id);
        
        // 2. Aggiorna le prenotazioni
        console.log('\n🔧 Aggiornamento prenotazioni...');
        
        const updateResult = await sql`
            UPDATE bookings 
            SET user_id = null 
            WHERE user_id = ANY(${barberUserIds})
        `;
        
        console.log(`✅ Aggiornate ${updateResult.count} prenotazioni`);
        
        // 3. Verifica
        const check = await sql`
            SELECT COUNT(*) as count
            FROM bookings 
            WHERE user_id = ANY(${barberUserIds})
        `;
        
        console.log(`📊 Verifica: ${check[0].count} prenotazioni ancora associate ai barbieri`);
        
        if (check[0].count === 0) {
            console.log('🎉 SUCCESSO! I barbieri ora possono fare prenotazioni multiple');
        }
        
    } catch (error) {
        console.error('❌ Errore:', error);
    }
}

quickFixBarberBookings();
