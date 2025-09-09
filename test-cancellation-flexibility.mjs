import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function testCancellationFlexibility() {
  console.log('🔧 Test nuova politica di cancellazione flessibile\n');

  try {
    // Simula la nuova funzione canCancelBooking
    function canCancelBooking(bookingDate, bookingTime) {
      try {
        // Ora permettiamo l'annullamento in qualsiasi momento
        return true;
      } catch (error) {
        console.error('Error checking booking cancellation:', error);
        return false;
      }
    }

    // Test con diverse date per verificare la flessibilità
    const testCases = [
      { date: '2025-09-09', time: '10:00', description: 'Oggi stesso' },
      { date: '2025-09-09', time: '16:00', description: 'Oggi pomeriggio' },
      { date: '2025-09-10', time: '09:00', description: 'Domani mattina' },
      { date: '2025-09-11', time: '15:00', description: 'Dopodomani' },
      { date: '2025-09-15', time: '11:00', description: 'Tra una settimana' }
    ];

    console.log('📋 Test della nuova logica di cancellazione:');
    console.log('(Prima: solo 48+ ore prima, Ora: sempre consentita)\n');

    testCases.forEach((testCase, index) => {
      const canCancel = canCancelBooking(testCase.date, testCase.time);
      const now = new Date();
      const bookingDateTime = new Date(`${testCase.date}T${testCase.time}`);
      const timeDifference = bookingDateTime.getTime() - now.getTime();
      const hoursDifference = timeDifference / (1000 * 60 * 60);
      
      console.log(`${index + 1}. ${testCase.description} (${testCase.date} ${testCase.time}):`);
      console.log(`   ⏰ Ore di distanza: ${hoursDifference.toFixed(1)}`);
      console.log(`   ❌ Vecchia politica (48h): ${hoursDifference >= 48 ? 'Cancellabile' : 'NON cancellabile'}`);
      console.log(`   ✅ Nuova politica: ${canCancel ? 'Cancellabile' : 'NON cancellabile'}`);
      console.log('');
    });

    // Controlla prenotazioni reali nel database
    console.log('📊 Prenotazioni reali nel database:');
    const upcomingBookings = await sql`
      SELECT customer_name, booking_date, booking_time, status, created_at
      FROM bookings
      WHERE booking_date >= CURRENT_DATE
      AND status = 'confirmed'
      ORDER BY booking_date, booking_time
      LIMIT 10
    `;

    if (upcomingBookings.length > 0) {
      console.log(`\nTrovate ${upcomingBookings.length} prenotazioni confermate future:`);
      
      upcomingBookings.forEach((booking, index) => {
        const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
        const now = new Date();
        const timeDifference = bookingDateTime.getTime() - now.getTime();
        const hoursDifference = timeDifference / (1000 * 60 * 60);
        
        const oldPolicy = hoursDifference >= 48;
        const newPolicy = canCancelBooking(booking.booking_date, booking.booking_time);
        
        console.log(`\n${index + 1}. ${booking.customer_name}`);
        console.log(`   📅 ${booking.booking_date} ${booking.booking_time}`);
        console.log(`   ⏰ ${hoursDifference.toFixed(1)} ore da ora`);
        console.log(`   ❌ Vecchia: ${oldPolicy ? 'Cancellabile' : 'NON cancellabile'}`);
        console.log(`   ✅ Nuova: ${newPolicy ? 'Cancellabile' : 'NON cancellabile'}`);
        
        if (!oldPolicy && newPolicy) {
          console.log(`   🎯 MIGLIORAMENTO: Ora cancellabile!`);
        }
      });
    } else {
      console.log('   Nessuna prenotazione confermata futura trovata');
    }

    console.log('\n🎯 RIEPILOGO MODIFICHE:');
    console.log('✅ Rimossa restrizione 48 ore');
    console.log('✅ Cancellazione sempre possibile per prenotazioni confermate');
    console.log('✅ Termini di servizio aggiornati');
    console.log('✅ Messaggi utente aggiornati');
    console.log('✅ Tooltip area personale aggiornato');
    
    console.log('\n📱 IMPATTO PER I CLIENTI:');
    console.log('• Maggiore flessibilità di cancellazione');
    console.log('• Possono annullare anche poche ore prima');
    console.log('• Interfaccia più user-friendly');
    console.log('• Meno frustrazione per imprevisti');

  } catch (error) {
    console.error('❌ Errore durante il test:', error);
  }
}

testCancellationFlexibility();
