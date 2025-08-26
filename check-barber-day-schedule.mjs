import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkBarberDaySchedule() {
    console.log('📅 Controllo prenotazioni multiple stesso giorno per barbiere...');
    
    try {
        // Esempio: Controlla Fabio per il 2 settembre 2025
        const barberId = 'fabio';
        const targetDate = '2025-09-02';
        
        console.log(`\n🔍 Prenotazioni di ${barberId.toUpperCase()} per ${targetDate}:`);
        console.log('='.repeat(60));
        
        const dayBookings = await sql`
            SELECT 
                customer_name, customer_email, customer_phone,
                time, service, price, status, created_at
            FROM bookings 
            WHERE barber_id = ${barberId} 
            AND date = ${targetDate}
            ORDER BY time
        `;
        
        if (dayBookings.length === 0) {
            console.log('❌ Nessuna prenotazione trovata per questa data');
        } else {
            console.log(`✅ Trovate ${dayBookings.length} prenotazioni:`);
            
            dayBookings.forEach((booking, index) => {
                const statusIcon = booking.status === 'confirmed' ? '✅' : 
                                 booking.status === 'pending' ? '⏳' : '❌';
                
                console.log(`\n📋 Prenotazione ${index + 1}:`);
                console.log(`   ⏰ Orario: ${booking.time}`);
                console.log(`   👤 Cliente: ${booking.customer_name}`);
                console.log(`   📧 Email: ${booking.customer_email || 'Non fornita'}`);
                console.log(`   📱 Telefono: ${booking.customer_phone || 'Non fornito'}`);
                console.log(`   💇 Servizio: ${booking.service} (€${booking.price})`);
                console.log(`   📊 Status: ${statusIcon} ${booking.status}`);
            });
            
            // Calcola statistiche della giornata
            const totalRevenue = dayBookings.reduce((sum, b) => sum + parseFloat(b.price), 0);
            const confirmedBookings = dayBookings.filter(b => b.status === 'confirmed').length;
            
            console.log(`\n📊 Riepilogo giornata:`);
            console.log(`   • Totale appuntamenti: ${dayBookings.length}`);
            console.log(`   • Confermati: ${confirmedBookings}`);
            console.log(`   • Ricavi potenziali: €${totalRevenue.toFixed(2)}`);
            console.log(`   • Primo appuntamento: ${dayBookings[0].time}`);
            console.log(`   • Ultimo appuntamento: ${dayBookings[dayBookings.length - 1].time}`);
        }
        
        // Controlla se ci sono conflitti di orario (non dovrebbero esserci)
        console.log(`\n🔍 Controllo conflitti di orario...`);
        const timeConflicts = await sql`
            SELECT time, COUNT(*) as count, 
                   STRING_AGG(customer_name, ', ') as customers
            FROM bookings 
            WHERE barber_id = ${barberId} 
            AND date = ${targetDate}
            GROUP BY time 
            HAVING COUNT(*) > 1
        `;
        
        if (timeConflicts.length === 0) {
            console.log('✅ Nessun conflitto di orario trovato');
        } else {
            console.log('⚠️ ATTENZIONE: Conflitti di orario rilevati:');
            timeConflicts.forEach(conflict => {
                console.log(`   🚨 ${conflict.time}: ${conflict.count} prenotazioni (${conflict.customers})`);
            });
        }
        
        // Mostra un esempio di come il barbiere può avere più prenotazioni
        console.log(`\n💡 ESEMPIO - Come funziona il sistema:`);
        console.log('✅ CONSENTITO: Fabio può avere questi appuntamenti il 2 settembre:');
        console.log('   • 09:00 - Mario Rossi (Taglio)');
        console.log('   • 10:30 - Luigi Bianchi (Barba)');
        console.log('   • 15:00 - Francesco Verdi (Taglio e Barba)');
        console.log('   • 17:00 - Antonio Neri (Taglio)');
        console.log('');
        console.log('❌ NON CONSENTITO: Fabio NON può avere:');
        console.log('   • 10:30 - Mario Rossi (Taglio)');
        console.log('   • 10:30 - Luigi Bianchi (Barba) ← STESSO ORARIO = CONFLITTO');
        
        // Verifica capacità massima giornaliera
        console.log(`\n📈 Analisi capacità giornaliera:`);
        
        // Calcola tutti gli slot disponibili per un giorno normale
        const allSlots = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
            "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
        ];
        
        const occupiedSlots = dayBookings.map(b => b.time);
        const availableSlots = allSlots.filter(slot => !occupiedSlots.includes(slot));
        
        console.log(`   • Slot totali giornalieri: ${allSlots.length}`);
        console.log(`   • Slot occupati: ${occupiedSlots.length} (${occupiedSlots.join(', ')})`);
        console.log(`   • Slot disponibili: ${availableSlots.length} (${availableSlots.join(', ')})`);
        console.log(`   • Tasso di occupazione: ${((occupiedSlots.length / allSlots.length) * 100).toFixed(1)}%`);
        
    } catch (error) {
        console.error('❌ Errore nel controllo:', error);
    }
}

checkBarberDaySchedule();
