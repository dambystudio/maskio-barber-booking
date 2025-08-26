import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function verifyClientBookings() {
    console.log('🔍 Script per verificare prenotazioni cliente...');
    console.log('Inserisci email o numero di telefono per cercare:');
    
    // Per questo esempio, cerchiamo i clienti appena aggiunti
    const searchTerms = [
        'Luigimaresca@gmail.com',
        '+39 327 687 5146',
        'Francesco Turco'
    ];
    
    try {
        for (const searchTerm of searchTerms) {
            console.log(`\n🔍 Ricerca per: "${searchTerm}"`);
            console.log('='.repeat(50));
            
            // Search by email, phone, or name
            const bookings = await sql`
                SELECT 
                    id, customer_name, customer_email, customer_phone,
                    barber_name, service, price, date, time, status,
                    created_at
                FROM bookings 
                WHERE 
                    customer_email ILIKE ${`%${searchTerm}%`} OR
                    customer_phone ILIKE ${`%${searchTerm}%`} OR
                    customer_name ILIKE ${`%${searchTerm}%`}
                ORDER BY date DESC, time DESC
            `;
            
            if (bookings.length === 0) {
                console.log('❌ Nessuna prenotazione trovata');
            } else {
                console.log(`✅ Trovate ${bookings.length} prenotazioni:`);
                
                bookings.forEach((booking, index) => {
                    const statusIcon = booking.status === 'confirmed' ? '✅' : 
                                     booking.status === 'pending' ? '⏳' : '❌';
                    
                    console.log(`\n📋 Prenotazione ${index + 1}:`);
                    console.log(`   👤 Cliente: ${booking.customer_name}`);
                    console.log(`   📧 Email: ${booking.customer_email || 'Non fornita'}`);
                    console.log(`   📱 Telefono: ${booking.customer_phone || 'Non fornito'}`);
                    console.log(`   ✂️ Barbiere: ${booking.barber_name}`);
                    console.log(`   💇 Servizio: ${booking.service} (€${booking.price})`);
                    console.log(`   📅 Data: ${booking.date} alle ${booking.time}`);
                    console.log(`   📊 Status: ${statusIcon} ${booking.status}`);
                    console.log(`   📝 Creata: ${new Date(booking.created_at).toLocaleString('it-IT')}`);
                });
                
                // Summary stats
                const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
                const totalValue = bookings.reduce((sum, b) => sum + parseFloat(b.price), 0);
                
                console.log(`\n📊 Riepilogo:`);
                console.log(`   • Totale prenotazioni: ${bookings.length}`);
                console.log(`   • Confermate: ${confirmedCount}`);
                console.log(`   • Valore totale: €${totalValue.toFixed(2)}`);
            }
        }
        
        // Search for potential duplicates
        console.log(`\n🔍 Controllo duplicati per email/telefono...`);
        console.log('='.repeat(50));
        
        const duplicates = await sql`
            SELECT customer_email, customer_phone, COUNT(*) as count
            FROM bookings 
            WHERE customer_email != '' OR customer_phone != ''
            GROUP BY customer_email, customer_phone 
            HAVING COUNT(*) > 1
            ORDER BY count DESC
        `;
        
        if (duplicates.length === 0) {
            console.log('✅ Nessun duplicato trovato');
        } else {
            console.log(`⚠️ Trovati ${duplicates.length} clienti con prenotazioni multiple:`);
            
            for (const dup of duplicates) {
                console.log(`\n📧 ${dup.customer_email || 'Email vuota'} | 📱 ${dup.customer_phone || 'Telefono vuoto'}`);
                console.log(`   📊 ${dup.count} prenotazioni`);
                
                // Get details for this client
                const clientBookings = await sql`
                    SELECT customer_name, date, time, barber_name, service, status
                    FROM bookings 
                    WHERE customer_email = ${dup.customer_email || ''} 
                    AND customer_phone = ${dup.customer_phone || ''}
                    ORDER BY date DESC
                `;
                
                clientBookings.forEach(booking => {
                    console.log(`   📅 ${booking.date} ${booking.time} - ${booking.service} con ${booking.barber_name} (${booking.status})`);
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Errore nella ricerca:', error);
    }
}

verifyClientBookings();
