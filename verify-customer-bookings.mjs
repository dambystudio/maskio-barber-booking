import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function searchCustomerBookings() {
    console.log('🔍 Ricerca prenotazioni cliente...\n');
    
    try {
        // Configurazione ricerca - puoi modificare questi valori
        const searchCriteria = {
            email: 'mario@test.com',          // Inserisci email da cercare (lascia vuoto se non vuoi cercare per email)
            phone: '+393331234567',           // Inserisci telefono da cercare (lascia vuoto se non vuoi cercare per telefono)
            customerName: ''                  // Inserisci nome da cercare (lascia vuoto se non vuoi cercare per nome)
        };
        
        console.log('🎯 Criteri di ricerca:');
        if (searchCriteria.email) console.log(`  📧 Email: ${searchCriteria.email}`);
        if (searchCriteria.phone) console.log(`  📱 Telefono: ${searchCriteria.phone}`);
        if (searchCriteria.customerName) console.log(`  👤 Nome: ${searchCriteria.customerName}`);
        console.log('');
        
        // Costruisci la query dinamicamente
        let whereConditions = [];
        let params = [];
        
        if (searchCriteria.email) {
            whereConditions.push('LOWER(customer_email) = LOWER($' + (params.length + 1) + ')');
            params.push(searchCriteria.email);
        }
        
        if (searchCriteria.phone) {
            // Normalizza il numero di telefono rimuovendo spazi e caratteri speciali
            const normalizedPhone = searchCriteria.phone.replace(/[\s\-\(\)]/g, '');
            whereConditions.push('REPLACE(REPLACE(REPLACE(customer_phone, \' \', \'\'), \'-\', \'\'), \'(\', \'\') LIKE \'%\' || $' + (params.length + 1) + ' || \'%\'');
            params.push(normalizedPhone.replace(/^\+/, ''));
        }
        
        if (searchCriteria.customerName) {
            whereConditions.push('LOWER(customer_name) ILIKE \'%\' || LOWER($' + (params.length + 1) + ') || \'%\'');
            params.push(searchCriteria.customerName);
        }
        
        if (whereConditions.length === 0) {
            console.log('❌ Nessun criterio di ricerca specificato. Modifica lo script per aggiungere email, telefono o nome.');
            return;
        }
        
        const whereClause = whereConditions.join(' OR ');
        
        // Esegui la ricerca
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
            console.log('❌ Nessuna prenotazione trovata con i criteri specificati.');
            return;
        }
        
        console.log(`📋 Trovate ${bookings.length} prenotazioni:\n`);
        
        // Raggruppa per cliente
        const customerGroups = {};
        bookings.forEach(booking => {
            const key = `${booking.customer_name || 'N/A'} - ${booking.customer_email || 'N/A'}`;
            if (!customerGroups[key]) {
                customerGroups[key] = {
                    customerInfo: {
                        name: booking.customer_name,
                        email: booking.customer_email,
                        phone: booking.customer_phone
                    },
                    bookings: []
                };
            }
            customerGroups[key].bookings.push(booking);
        });
        
        // Mostra risultati
        Object.entries(customerGroups).forEach(([customerKey, customerData], index) => {
            console.log(`👤 CLIENTE ${index + 1}:`);
            console.log(`   Nome: ${customerData.customerInfo.name || 'N/A'}`);
            console.log(`   Email: ${customerData.customerInfo.email || 'N/A'}`);
            console.log(`   Telefono: ${customerData.customerInfo.phone || 'N/A'}`);
            console.log(`   Prenotazioni: ${customerData.bookings.length}`);
            console.log('');
            
            customerData.bookings.forEach((booking, bookingIndex) => {
                const statusIcon = {
                    'confirmed': '✅',
                    'pending': '⏳',
                    'cancelled': '❌'
                }[booking.status] || '❓';
                
                console.log(`   📅 PRENOTAZIONE ${bookingIndex + 1}:`);
                console.log(`      ID: ${booking.id}`);
                console.log(`      Data: ${booking.booking_date} ore ${booking.booking_time}`);
                console.log(`      Barbiere: ${booking.barber_name}`);
                console.log(`      Servizio: ${booking.service_name}`);
                console.log(`      Prezzo: €${booking.service_price || 'N/A'}`);
                console.log(`      Status: ${statusIcon} ${booking.status.toUpperCase()}`);
                if (booking.notes) console.log(`      Note: ${booking.notes}`);
                console.log(`      Creata il: ${new Date(booking.created_at).toLocaleString('it-IT')}`);
                console.log('');
            });
            
            console.log('─'.repeat(60));
            console.log('');
        });
        
        // Statistiche
        console.log('📊 STATISTICHE:');
        console.log(`   Totale clienti trovati: ${Object.keys(customerGroups).length}`);
        console.log(`   Totale prenotazioni: ${bookings.length}`);
        
        const statusCounts = bookings.reduce((acc, booking) => {
            acc[booking.status] = (acc[booking.status] || 0) + 1;
            return acc;
        }, {});
        
        console.log('\n   Status delle prenotazioni:');
        Object.entries(statusCounts).forEach(([status, count]) => {
            const icon = {
                'confirmed': '✅',
                'pending': '⏳',
                'cancelled': '❌'
            }[status] || '❓';
            console.log(`     ${icon} ${status.toUpperCase()}: ${count}`);
        });
        
        // Prenotazioni future
        const today = new Date().toISOString().split('T')[0];
        const futureBookings = bookings.filter(b => b.booking_date >= today && b.status === 'confirmed');
        console.log(`\n   🔮 Prenotazioni future confermate: ${futureBookings.length}`);
        
        if (futureBookings.length > 0) {
            console.log('\n   📅 PROSSIMI APPUNTAMENTI:');
            futureBookings.slice(0, 5).forEach(booking => {
                console.log(`     • ${booking.booking_date} ${booking.booking_time} - ${booking.service_name} con ${booking.barber_name}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Errore durante la ricerca:', error);
    }
}

// Funzione per cercare possibili duplicati
async function findPossibleDuplicates() {
    console.log('\n🔍 Ricerca possibili duplicati...\n');
    
    try {
        // Cerca duplicati per email
        const emailDuplicates = await sql`
            SELECT 
                customer_email,
                COUNT(*) as booking_count,
                COUNT(DISTINCT customer_name) as name_variations,
                COUNT(DISTINCT customer_phone) as phone_variations,
                STRING_AGG(DISTINCT customer_name, ', ') as all_names,
                STRING_AGG(DISTINCT customer_phone, ', ') as all_phones
            FROM bookings 
            WHERE customer_email IS NOT NULL AND customer_email != ''
            GROUP BY LOWER(customer_email)
            HAVING COUNT(*) > 1
            ORDER BY booking_count DESC
        `;
        
        if (emailDuplicates.length > 0) {
            console.log('📧 DUPLICATI PER EMAIL:');
            emailDuplicates.forEach(dup => {
                console.log(`   ${dup.customer_email}:`);
                console.log(`     Prenotazioni: ${dup.booking_count}`);
                console.log(`     Nomi usati: ${dup.all_names}`);
                console.log(`     Telefoni usati: ${dup.all_phones}`);
                console.log('');
            });
        } else {
            console.log('✅ Nessun duplicato trovato per email');
        }
        
        // Cerca duplicati per telefono (normalizzato)
        const phoneDuplicates = await sql`
            SELECT 
                customer_phone,
                COUNT(*) as booking_count,
                COUNT(DISTINCT customer_name) as name_variations,
                COUNT(DISTINCT customer_email) as email_variations,
                STRING_AGG(DISTINCT customer_name, ', ') as all_names,
                STRING_AGG(DISTINCT customer_email, ', ') as all_emails
            FROM bookings 
            WHERE customer_phone IS NOT NULL AND customer_phone != ''
            GROUP BY REPLACE(REPLACE(REPLACE(customer_phone, ' ', ''), '-', ''), '(', '')
            HAVING COUNT(*) > 1
            ORDER BY booking_count DESC
        `;
        
        if (phoneDuplicates.length > 0) {
            console.log('\n📱 DUPLICATI PER TELEFONO:');
            phoneDuplicates.forEach(dup => {
                console.log(`   ${dup.customer_phone}:`);
                console.log(`     Prenotazioni: ${dup.booking_count}`);
                console.log(`     Nomi usati: ${dup.all_names}`);
                console.log(`     Email usate: ${dup.all_emails}`);
                console.log('');
            });
        } else {
            console.log('\n✅ Nessun duplicato trovato per telefono');
        }
        
    } catch (error) {
        console.error('❌ Errore durante la ricerca duplicati:', error);
    }
}

// Esegui entrambe le funzioni
console.log('🚀 Avvio verifica prenotazioni cliente...\n');
await searchCustomerBookings();
await findPossibleDuplicates();
console.log('\n✅ Verifica completata!');
