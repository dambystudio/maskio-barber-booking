import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testSearch() {
    console.log('\n🔍 TEST RICERCA CLIENTE');
    console.log('='.repeat(80));
    
    try {
        // First, check what bookings exist
        console.log('\n📋 PRENOTAZIONI NEL DATABASE:\n');
        const allBookings = await sql`
            SELECT customer_name, COUNT(*) as count 
            FROM bookings 
            GROUP BY customer_name 
            ORDER BY count DESC 
            LIMIT 10
        `;
        
        console.log('Top 10 clienti per numero di prenotazioni:');
        allBookings.forEach((b, i) => {
            console.log(`   ${i + 1}. ${b.customer_name} (${b.count} prenotazioni)`);
        });
        
        // Test search with a real customer name
        if (allBookings.length > 0) {
            const testName = allBookings[0].customer_name;
            console.log(`\n🧪 TEST RICERCA: "${testName}"\n`);
            
            // Try exact match first
            const exactMatch = await sql`
                SELECT 
                    id,
                    date as booking_date,
                    time as booking_time,
                    customer_name,
                    customer_phone,
                    customer_email,
                    status,
                    notes,
                    created_at,
                    service as service_name,
                    barber_name,
                    barber_id
                FROM bookings
                WHERE customer_name = ${testName}
                ORDER BY date DESC, time DESC
                LIMIT 5
            `;
            
            console.log(`✅ Exact match: ${exactMatch.length} risultati`);
            if (exactMatch.length > 0) {
                console.log('   Esempio:', exactMatch[0]);
            }
            
            // Try LIKE search with first few characters
            const partialName = testName.substring(0, 3);
            console.log(`\n🔍 LIKE search per "${partialName}":\n`);
            
            const likeMatch = await sql`
                SELECT 
                    id,
                    date as booking_date,
                    time as booking_time,
                    customer_name,
                    customer_phone,
                    customer_email,
                    status,
                    notes,
                    created_at,
                    service as service_name,
                    barber_name,
                    barber_id
                FROM bookings
                WHERE LOWER(customer_name) LIKE LOWER(${'%' + partialName + '%'})
                ORDER BY date DESC, time DESC
                LIMIT 5
            `;
            
            console.log(`✅ LIKE match: ${likeMatch.length} risultati`);
            if (likeMatch.length > 0) {
                likeMatch.forEach((m, i) => {
                    console.log(`   ${i + 1}. ${m.customer_name} - ${m.booking_date} ${m.booking_time}`);
                });
            }
            
            // Test the actual search function logic
            console.log(`\n🧪 TEST FUNZIONE searchBookingsByCustomer:\n`);
            
            const searchResult = await sql`
                SELECT 
                    id,
                    date as booking_date,
                    time as booking_time,
                    customer_name,
                    customer_phone,
                    customer_email,
                    status,
                    notes,
                    created_at,
                    service as service_name,
                    barber_name,
                    barber_id
                FROM bookings
                WHERE LOWER(customer_name) LIKE LOWER(${'%' + partialName + '%'})
                ORDER BY date DESC, time DESC
                LIMIT 100
            `;
            
            console.log(`✅ searchBookingsByCustomer logic: ${searchResult.length} risultati`);
            
        } else {
            console.log('\n⚠️ Nessuna prenotazione nel database!');
        }
        
    } catch (error) {
        console.error('❌ ERRORE:', error);
        throw error;
    }
}

testSearch()
    .then(() => {
        console.log('\n✅ Test completato\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Test fallito:', error);
        process.exit(1);
    });
