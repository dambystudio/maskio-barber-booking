import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function analyzeFabioBookingsIssue() {
    console.log('🔍 Analisi problema prenotazioni multiple Fabio...');
    
    try {
        // Trova l'utente Fabio
        const fabioUser = await sql`
            SELECT id, name, email, role 
            FROM users 
            WHERE email ILIKE '%fabio%' OR name ILIKE '%fabio%'
        `;
        
        if (fabioUser.length === 0) {
            console.log('❌ Utente Fabio non trovato nella tabella users');
            return;
        }
        
        console.log(`✅ Trovato utente Fabio:`);
        fabioUser.forEach(user => {
            console.log(`   - ID: ${user.id}`);
            console.log(`   - Nome: ${user.name}`);
            console.log(`   - Email: ${user.email}`);
            console.log(`   - Ruolo: ${user.role}`);
        });
        
        const fabioUserId = fabioUser[0].id;
        
        // Controlla prenotazioni dove Fabio è il user_id (chi ha fatto la prenotazione)
        console.log(`\n🔍 Prenotazioni dove Fabio è il PRENOTATORE (user_id = ${fabioUserId}):`);
        console.log('='.repeat(70));
        
        const fabioAsBooker = await sql`
            SELECT 
                customer_name, customer_email, customer_phone,
                barber_id, barber_name, service, date, time, 
                status, created_at
            FROM bookings 
            WHERE user_id = ${fabioUserId}
            ORDER BY date DESC, time DESC
            LIMIT 10
        `;
        
        if (fabioAsBooker.length === 0) {
            console.log('✅ Nessuna prenotazione dove Fabio è il prenotatore');
        } else {
            console.log(`⚠️ PROBLEMA TROVATO! ${fabioAsBooker.length} prenotazioni con user_id di Fabio:`);
            
            fabioAsBooker.forEach((booking, index) => {
                console.log(`\n📋 Prenotazione ${index + 1}:`);
                console.log(`   👤 Cliente: ${booking.customer_name}`);
                console.log(`   📧 Email cliente: ${booking.customer_email}`);
                console.log(`   ✂️ Barbiere: ${booking.barber_name} (${booking.barber_id})`);
                console.log(`   📅 Data: ${booking.date} alle ${booking.time}`);
                console.log(`   💇 Servizio: ${booking.service}`);
                console.log(`   📊 Status: ${booking.status}`);
                console.log(`   📝 Creata: ${new Date(booking.created_at).toLocaleString('it-IT')}`);
            });
            
            // Analizza per data
            const bookingsByDate = {};
            fabioAsBooker.forEach(booking => {
                if (!bookingsByDate[booking.date]) {
                    bookingsByDate[booking.date] = [];
                }
                bookingsByDate[booking.date].push(booking);
            });
            
            console.log(`\n📊 Analisi per data:`);
            Object.entries(bookingsByDate).forEach(([date, bookings]) => {
                console.log(`   📅 ${date}: ${bookings.length} prenotazioni`);
                if (bookings.length > 1) {
                    console.log(`      ⚠️ CONFLITTO POTENZIALE - Più prenotazioni stesso giorno!`);
                    bookings.forEach(b => {
                        console.log(`         ${b.time} - ${b.customer_name} con ${b.barber_name}`);
                    });
                }
            });
        }
        
        // Controlla prenotazioni dove Fabio è il barbiere
        console.log(`\n🔍 Prenotazioni dove Fabio è il BARBIERE (barber_id = 'fabio'):`);
        console.log('='.repeat(70));
        
        const fabioAsBarber = await sql`
            SELECT 
                customer_name, date, time, user_id,
                COUNT(*) OVER (PARTITION BY date) as same_day_count
            FROM bookings 
            WHERE barber_id = 'fabio'
            AND date >= '2025-09-01'
            ORDER BY date DESC, time DESC
            LIMIT 10
        `;
        
        console.log(`✅ ${fabioAsBarber.length} prenotazioni dove Fabio è il barbiere:`);
        fabioAsBarber.forEach((booking, index) => {
            const multipleIcon = booking.same_day_count > 1 ? '✅' : '⚡';
            console.log(`   ${multipleIcon} ${booking.date} ${booking.time} - ${booking.customer_name} (user_id: ${booking.user_id || 'null'})`);
        });
        
        // Identifica il problema
        console.log(`\n🎯 DIAGNOSI DEL PROBLEMA:`);
        console.log('='.repeat(50));
        console.log(`❌ PROBLEMA: Quando Fabio fa una prenotazione per un cliente,`);
        console.log(`   il sistema registra user_id = ${fabioUserId} (ID di Fabio)`);
        console.log(`   Poi quando prova a fare un'altra prenotazione lo stesso giorno,`);
        console.log(`   il controllo trova già una prenotazione con il suo user_id!`);
        console.log(``);
        console.log(`✅ SOLUZIONE: Quando un barbiere fa prenotazioni per clienti,`);
        console.log(`   NON dovrebbe usare il suo user_id, ma:`);
        console.log(`   - user_id = null (per clienti senza account)`);
        console.log(`   - user_id = cliente_id (se il cliente ha un account)`);
        console.log(`   - Il controllo deve essere su (barbiere_id + data + ora), non su (user_id + data)`);
        
    } catch (error) {
        console.error('❌ Errore nell\'analisi:', error);
    }
}

analyzeFabioBookingsIssue();
