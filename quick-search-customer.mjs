import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function quickSearchCustomer() {
    console.log('🔍 RICERCA VELOCE CLIENTE\n');
    
    // ==========================================
    // MODIFICA QUI I DATI DA CERCARE
    // ==========================================
    
    const SEARCH_EMAIL = '';              // Inserisci email da cercare
    const SEARCH_PHONE = '';              // Inserisci telefono da cercare  
    const SEARCH_NAME = '';               // Inserisci nome da cercare
    
    // ==========================================
    
    if (!SEARCH_EMAIL && !SEARCH_PHONE && !SEARCH_NAME) {
        console.log('❌ ERRORE: Devi specificare almeno un criterio di ricerca.');
        console.log('📝 Modifica lo script e compila una di queste variabili:');
        console.log('   - SEARCH_EMAIL = "email@esempio.com"');
        console.log('   - SEARCH_PHONE = "+393331234567"');
        console.log('   - SEARCH_NAME = "Mario Rossi"');
        return;
    }
    
    try {
        console.log('🎯 Ricerca per:');
        if (SEARCH_EMAIL) console.log(`   📧 Email: ${SEARCH_EMAIL}`);
        if (SEARCH_PHONE) console.log(`   📱 Telefono: ${SEARCH_PHONE}`);
        if (SEARCH_NAME) console.log(`   👤 Nome: ${SEARCH_NAME}`);
        console.log('');
        
        // Costruisci query
        let whereConditions = [];
        
        if (SEARCH_EMAIL) {
            whereConditions.push(`LOWER(customer_email) = LOWER('${SEARCH_EMAIL}')`);
        }
        
        if (SEARCH_PHONE) {
            const cleanPhone = SEARCH_PHONE.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
            whereConditions.push(`REPLACE(REPLACE(REPLACE(customer_phone, ' ', ''), '-', ''), '(', '') LIKE '%${cleanPhone}%'`);
        }
        
        if (SEARCH_NAME) {
            whereConditions.push(`LOWER(customer_name) ILIKE '%${SEARCH_NAME.toLowerCase()}%'`);
        }
        
        const whereClause = whereConditions.join(' OR ');
        
        const bookings = await sql`
            SELECT 
                id,
                customer_name,
                customer_email,
                customer_phone,
                barber_name,
                service_name,
                booking_date,
                booking_time,
                status,
                service_price,
                notes,
                created_at
            FROM bookings 
            WHERE ${sql.unsafe(whereClause)}
            ORDER BY booking_date DESC, booking_time DESC
        `;
        
        if (bookings.length === 0) {
            console.log('❌ NESSUNA PRENOTAZIONE TROVATA');
            console.log('💡 Suggerimenti:');
            console.log('   - Controlla che email/telefono/nome siano scritti correttamente');
            console.log('   - Prova a cercare solo parte del nome');
            console.log('   - Controlla variazioni del numero di telefono');
            return;
        }
        
        console.log(`📋 TROVATE ${bookings.length} PRENOTAZIONI\n`);
        
        // Info cliente
        const firstBooking = bookings[0];
        console.log('👤 DATI CLIENTE:');
        console.log(`   Nome: ${firstBooking.customer_name || 'N/A'}`);
        console.log(`   Email: ${firstBooking.customer_email || 'N/A'}`);
        console.log(`   Telefono: ${firstBooking.customer_phone || 'N/A'}`);
        console.log('');
        
        // Lista prenotazioni
        console.log('📅 CRONOLOGIA PRENOTAZIONI:');
        console.log('');
        
        bookings.forEach((booking, index) => {
            const statusIcon = {
                'confirmed': '✅',
                'pending': '⏳', 
                'cancelled': '❌'
            }[booking.status] || '❓';
            
            const isUpcoming = booking.booking_date >= new Date().toISOString().split('T')[0];
            const datePrefix = isUpcoming ? '🔮' : '📋';
            
            console.log(`${datePrefix} ${index + 1}. ${booking.booking_date} ore ${booking.booking_time} ${statusIcon}`);
            console.log(`      ${booking.service_name} con ${booking.barber_name}`);
            console.log(`      Prezzo: €${booking.service_price || 'N/A'} | ID: ${booking.id}`);
            if (booking.notes) console.log(`      Note: ${booking.notes}`);
            console.log('');
        });
        
        // Statistiche veloci
        const confirmed = bookings.filter(b => b.status === 'confirmed').length;
        const cancelled = bookings.filter(b => b.status === 'cancelled').length;
        const pending = bookings.filter(b => b.status === 'pending').length;
        const future = bookings.filter(b => b.booking_date >= new Date().toISOString().split('T')[0] && b.status === 'confirmed').length;
        
        console.log('📊 RIEPILOGO:');
        console.log(`   ✅ Confermate: ${confirmed} | ❌ Cancellate: ${cancelled} | ⏳ In attesa: ${pending}`);
        console.log(`   🔮 Prossimi appuntamenti: ${future}`);
        
        // Calcola totale speso
        const totalSpent = bookings
            .filter(b => b.status === 'confirmed' && b.service_price)
            .reduce((sum, b) => sum + (parseFloat(b.service_price) || 0), 0);
            
        if (totalSpent > 0) {
            console.log(`   💰 Totale speso: €${totalSpent.toFixed(2)}`);
        }
        
    } catch (error) {
        console.error('❌ Errore durante la ricerca:', error);
    }
}

quickSearchCustomer();
