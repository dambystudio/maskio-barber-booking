import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function testBarberPhoneInBookings() {
  console.log('🧪 Test funzionalità WhatsApp barbiere...\n');

  try {
    // 1. Verifica che i barbieri abbiano numeri di telefono
    console.log('1️⃣ Verifica numeri di telefono barbieri:');
    const barbers = await sql`SELECT id, name, phone FROM barbers`;
    barbers.forEach(barber => {
      console.log(`   📞 ${barber.name}: ${barber.phone || 'MANCANTE!'}`);
    });

    // 2. Test API prenotazioni (simuliamo la risposta)
    console.log('\n2️⃣ Test API bookings con telefono barbiere:');
    
    try {
      const response = await fetch('http://localhost:3000/api/bookings');
      if (response.ok) {
        const data = await response.json();
        
        if (data.bookings && data.bookings.length > 0) {
          console.log(`✅ API restituisce ${data.bookings.length} prenotazioni`);
          
          // Verifica la prima prenotazione
          const booking = data.bookings[0];
          console.log('\n📋 Esempio prenotazione:');
          console.log(`   Cliente: ${booking.customer_name}`);
          console.log(`   Tel. Cliente: ${booking.customer_phone}`);
          console.log(`   Barbiere: ${booking.barber_name}`);
          console.log(`   Tel. Barbiere: ${booking.barber_phone || 'MANCANTE!'}`);
          
          // Verifica quante prenotazioni hanno il telefono del barbiere
          const withBarberPhone = data.bookings.filter(b => b.barber_phone);
          console.log(`\n📊 Prenotazioni con telefono barbiere: ${withBarberPhone.length}/${data.bookings.length}`);
          
          if (withBarberPhone.length === 0) {
            console.log('⚠️  PROBLEMA: Nessuna prenotazione ha il telefono del barbiere!');
            console.log('   Verifica che l\'API sia stata aggiornata correttamente.');
          } else {
            console.log('✅ API aggiornata correttamente!');
          }
        } else {
          console.log('📭 Nessuna prenotazione trovata');
        }
      } else {
        console.log(`❌ API Error: ${response.status}`);
      }
    } catch (error) {
      console.log('🔴 Server non attivo o irraggiungibile');
      console.log('   Avvia il server con: npm run dev');
    }

    // 3. Genera URL WhatsApp di esempio
    console.log('\n3️⃣ Test generazione URL WhatsApp barbiere:');
    
    if (barbers.length > 0 && barbers[0].phone) {
      const barber = barbers[0];
      const phone = barber.phone.replace(/\D/g, '');
      let whatsappPhone = phone;
      
      if (phone.startsWith('3') && phone.length === 10) {
        whatsappPhone = '39' + phone;
      } else if (!phone.startsWith('39') && phone.length === 10) {
        whatsappPhone = '39' + phone;
      }
      
      const message = `Ciao ${barber.name}! 👋

Ti contatto riguardo alla prenotazione:

👤 *Cliente:* Mario Rossi
📅 *Data:* 18/06/2025
🕐 *Orario:* 10:00
✂️ *Servizio:* Taglio

Ho una domanda riguardo all'appuntamento.

Grazie! 😊`;

      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
      
      console.log(`📱 URL WhatsApp per ${barber.name}:`);
      console.log(`   Tel: ${barber.phone} → ${whatsappPhone}`);
      console.log(`   URL: ${whatsappUrl.substring(0, 100)}...`);
    }

    console.log('\n🎯 ISTRUZIONI PER IL TEST:');
    console.log('1. Avvia il server: npm run dev');
    console.log('2. Vai su: http://localhost:3000/pannello-prenotazioni');
    console.log('3. Accedi come admin o barbiere');
    console.log('4. Verifica che i pulsanti "📱 Barbiere" e "📞 Barbiere" siano visibili');
    console.log('5. Clicca sui pulsanti per testare WhatsApp e chiamate');
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
  }
}

testBarberPhoneInBookings();
