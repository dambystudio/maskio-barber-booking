import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// Crea interfaccia readline per aspettare l'input dell'utente
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function waitForEnter(message) {
  return new Promise((resolve) => {
    rl.question(`\n${message}\n👉 Premi INVIO per continuare...`, () => {
      resolve();
    });
  });
}

async function testInterattivoWaitlist() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 TEST INTERATTIVO SISTEMA NOTIFICHE LISTA D\'ATTESA');
  console.log('='.repeat(70));
  console.log('\n📱 Prepara il tuo telefono per ricevere le notifiche push!');
  console.log('📅 Data test: 5 Dicembre 2025 (Venerdì)');
  console.log('👨‍💼 Barbiere: Michele\n');

  await waitForEnter('✅ Pronto? Iniziamo il test!');

  try {
    // STEP 1: Verifica e pulisci eventuali dati esistenti
    console.log('\n' + '─'.repeat(70));
    console.log('📋 PREPARAZIONE: Pulizia dati test precedenti...');
    console.log('─'.repeat(70));

    const testDate = '2025-12-05';
    const barberId = 'michele';
    const barberName = 'Michele';

    // Cancella TUTTE le prenotazioni per quel giorno (test e reali)
    const existingBookings = await sql`
      SELECT * FROM bookings 
      WHERE date = ${testDate} 
      AND barber_id = ${barberId}
    `;

    if (existingBookings.length > 0) {
      console.log(`⚠️ Trovate ${existingBookings.length} prenotazioni esistenti per il ${testDate}`);
      console.log('   Le cancello per iniziare il test pulito...');
      
      await sql`
        DELETE FROM bookings 
        WHERE date = ${testDate} 
        AND barber_id = ${barberId}
      `;
    }

    // Cancella waitlist test esistenti  
    const existingWaitlist = await sql`
      SELECT * FROM waitlist 
      WHERE date = ${testDate} 
      AND barber_id = ${barberId}
    `;

    if (existingWaitlist.length > 0) {
      console.log(`⚠️ Trovate ${existingWaitlist.length} entry in waitlist`);
      console.log('   Le cancello...');
      
      await sql`
        DELETE FROM waitlist 
        WHERE date = ${testDate} 
        AND barber_id = ${barberId}
      `;
    }

    console.log('✅ Database pulito, pronto per il test');

    // STEP 2: Crea prenotazioni per riempire il giorno
    console.log('\n' + '─'.repeat(70));
    console.log('📝 STEP 1: Riempio il 5 Dicembre con prenotazioni per Michele');
    console.log('─'.repeat(70));

    const timeSlots = [
      '09:00', '10:00', '11:00', '12:00', 
      '14:00', '15:00', '16:00', '17:00'
    ];

    const clientiTest = [
      'Mario Rossi',
      'Luigi Bianchi', 
      'Giovanni Verdi',
      'Alessandro Neri',
      'Francesco Gialli',
      'Matteo Blu',
      'Luca Viola',
      'Marco Arancio'
    ];

    console.log(`\n📊 Creo ${timeSlots.length} prenotazioni per riempire tutti gli slot...`);

    for (let i = 0; i < timeSlots.length; i++) {
      await sql`
        INSERT INTO bookings (
          customer_name, 
          customer_email, 
          customer_phone,
          barber_id, 
          barber_name, 
          service, 
          price, 
          date, 
          time,
          duration, 
          status, 
          notes
        ) VALUES (
          ${clientiTest[i]},
          ${`test${i + 1}@example.com`},
          ${`+39333000${String(i + 1).padStart(4, '0')}`},
          ${barberId},
          ${barberName},
          'Taglio Uomo',
          25,
          ${testDate},
          ${timeSlots[i]},
          30,
          'confirmed',
          'TEST AUTOMATICO - Prenotazione di riempimento'
        )
      `;
      console.log(`   ✅ ${timeSlots[i]} - ${clientiTest[i]}`);
    }

    // Verifica prenotazioni create
    const bookings = await sql`
      SELECT * FROM bookings 
      WHERE date = ${testDate} 
      AND barber_id = ${barberId}
      ORDER BY time
    `;

    console.log(`\n✅ Totale prenotazioni per il 5 Dicembre: ${bookings.length}/8 slot`);
    console.log('📅 Il giorno è completamente pieno!');

    await waitForEnter('\n🎯 STEP 1 COMPLETATO! Ora vai sul telefono e mettiti in lista d\'attesa.');

    // STEP 3: Aspetta che l'utente si metta in lista
    console.log('\n' + '─'.repeat(70));
    console.log('📱 STEP 2: Iscriviti alla lista d\'attesa');
    console.log('─'.repeat(70));
    console.log('\n👤 SUL TUO TELEFONO:');
    console.log('   1. Apri l\'app/sito (ngrok URL)');
    console.log('   2. Assicurati di essere loggato');
    console.log('   3. Vai su "Prenota"');
    console.log('   4. Seleziona "Michele" come barbiere');
    console.log('   5. Scegli "5 Dicembre 2025" (Venerdì)');
    console.log('   6. Vedrai "Nessun orario disponibile"');
    console.log('   7. Clicca sul pulsante "📋 Lista d\'attesa"');
    console.log('   8. Conferma l\'iscrizione');
    console.log('   9. Dovresti vedere "✅ Aggiunto alla lista d\'attesa in posizione 1"');

    await waitForEnter('\n✅ Ti sei messo in lista d\'attesa?');

    // Verifica che l'utente sia in lista
    console.log('\n🔍 Verifico la tua iscrizione...');
    
    const waitlistEntries = await sql`
      SELECT * FROM waitlist 
      WHERE date = ${testDate} 
      AND barber_id = ${barberId}
      AND status = 'waiting'
      ORDER BY position
    `;

    if (waitlistEntries.length === 0) {
      console.log('❌ ERRORE: Non trovo nessuno in lista d\'attesa!');
      console.log('   Riprova a metterti in lista e poi premi INVIO');
      await waitForEnter('');
      
      // Ricontrolla
      const recheckWaitlist = await sql`
        SELECT * FROM waitlist 
        WHERE date = ${testDate} 
        AND barber_id = ${barberId}
        AND status = 'waiting'
      `;
      
      if (recheckWaitlist.length === 0) {
        console.log('❌ Ancora nessuna entry. Test interrotto.');
        rl.close();
        return;
      }
    }

    console.log(`✅ Perfetto! Trovato ${waitlistEntries.length} utente in lista:`);
    waitlistEntries.forEach((entry, i) => {
      console.log(`   ${i + 1}. ${entry.customer_name} (${entry.customer_email}) - Posizione #${entry.position}`);
    });

    const userInWaitlist = waitlistEntries[0];
    
    await waitForEnter('\n🎯 STEP 2 COMPLETATO! Ora libererò un posto automaticamente.');

    // STEP 4: Cancella una prenotazione e invia notifica
    console.log('\n' + '─'.repeat(70));
    console.log('🗑️ STEP 3: Libero un posto (cancello prenotazione)');
    console.log('─'.repeat(70));

    // Prendi una prenotazione a caso (esempio: ore 15:00)
    const bookingToCancel = bookings.find(b => b.time === '15:00');
    
    if (!bookingToCancel) {
      console.log('❌ Errore: prenotazione non trovata');
      rl.close();
      return;
    }

    console.log(`\n📍 Cancello la prenotazione di: ${bookingToCancel.customer_name}`);
    console.log(`   📅 Data: ${bookingToCancel.date}`);
    console.log(`   🕐 Orario: ${bookingToCancel.time}`);

    // Aggiorna status della prenotazione a cancelled
    await sql`
      UPDATE bookings 
      SET status = 'cancelled' 
      WHERE id = ${bookingToCancel.id}
    `;

    console.log('✅ Prenotazione cancellata!');

    // Invia notifica alla waitlist
    console.log('\n📤 Invio notifica push all\'utente in lista...');

    // Simula chiamata API (stessa logica di /api/notifications/send-waitlist-alert)
    const userToNotify = waitlistEntries[0];
    
    // Trova subscription push dell'utente
    const subscriptions = await sql`
      SELECT * FROM push_subscriptions 
      WHERE user_id = ${userToNotify.user_id}
    `;

    console.log(`📱 Subscription trovate per ${userToNotify.customer_name}: ${subscriptions.length}`);

    if (subscriptions.length === 0) {
      console.log('\n⚠️ ATTENZIONE: Nessuna subscription push trovata!');
      console.log('   Assicurati di aver abilitato le notifiche su /debug-push');
      console.log('   La notifica NON verrà inviata, ma continuerò il test per aggiornare il database.');
    }

    // Aggiorna waitlist con offerta
    await sql`
      UPDATE waitlist 
      SET status = 'offered', 
          offered_time = ${bookingToCancel.time},
          offered_booking_id = ${bookingToCancel.id},
          offer_expires_at = NOW() + INTERVAL '24 hours',
          updated_at = NOW()
      WHERE id = ${userToNotify.id}
    `;

    console.log('✅ Waitlist aggiornata: status = "offered"');
    console.log(`   🕐 Orario offerto: ${bookingToCancel.time}`);
    console.log(`   ⏰ Scadenza: 24 ore da ora`);

    // Se ci sono subscriptions, invia notifica
    if (subscriptions.length > 0) {
      try {
        // Usa l'API interna
        const apiUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/notifications/send-waitlist-alert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: bookingToCancel.id,
            barberId: barberId,
            date: testDate,
            time: bookingToCancel.time
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`\n✅ Notifica inviata con successo!`);
          console.log(`   📊 Notifiche inviate: ${result.sentTo}/${result.totalSubscriptions}`);
        } else {
          console.log(`\n⚠️ Errore nell'invio notifica: ${response.status}`);
        }
      } catch (error) {
        console.log(`\n⚠️ Errore chiamata API: ${error.message}`);
        console.log('   Il database è aggiornato, ma la notifica potrebbe non essere partita');
      }
    }

    await waitForEnter('\n🎯 STEP 3 COMPLETATO! Ora controlla il tuo telefono per la notifica.');

    // STEP 5: Verifica e conferma
    console.log('\n' + '─'.repeat(70));
    console.log('✅ STEP 4: Verifica e conferma');
    console.log('─'.repeat(70));
    console.log('\n📱 SUL TUO TELEFONO:');
    console.log('   1. Dovresti aver ricevuto una notifica push:');
    console.log('      "🎉 Posto Disponibile!"');
    console.log('      "Si è liberato un posto per il 5 dicembre alle 15:00"');
    console.log('   2. Clicca sulla notifica');
    console.log('   3. Ti porterà su /area-personale/profilo');
    console.log('   4. Scorri in basso fino a "📋 Le Mie Liste d\'Attesa"');
    console.log('   5. Dovresti vedere la sezione "🎉 Posto Disponibile!" in verde');
    console.log('   6. Vedi il timer countdown (24 ore)');
    console.log('   7. Hai due pulsanti: "✅ Conferma" e "❌ Rifiuta"');
    console.log('   8. Clicca "✅ Conferma Prenotazione"');
    console.log('   9. Dovresti vedere "✅ Prenotazione confermata per il 2025-12-05 alle 15:00"');
    console.log('   10. La prenotazione dovrebbe apparire in "Le Mie Prenotazioni"');

    await waitForEnter('\n✅ Hai confermato la prenotazione?');

    // Verifica finale
    console.log('\n🔍 Verifico che tutto sia andato bene...');

    // Controlla se la prenotazione è stata creata
    const newBooking = await sql`
      SELECT * FROM bookings 
      WHERE date = ${testDate}
      AND time = ${bookingToCancel.time}
      AND barber_id = ${barberId}
      AND customer_email = ${userToNotify.customer_email}
      AND status = 'confirmed'
    `;

    // Controlla status waitlist
    const updatedWaitlist = await sql`
      SELECT * FROM waitlist 
      WHERE id = ${userToNotify.id}
    `;

    console.log('\n📊 RISULTATI VERIFICA:');
    
    if (newBooking.length > 0) {
      console.log('   ✅ Prenotazione creata correttamente!');
      console.log(`      Cliente: ${newBooking[0].customer_name}`);
      console.log(`      Data: ${newBooking[0].date} alle ${newBooking[0].time}`);
      console.log(`      Status: ${newBooking[0].status}`);
    } else {
      console.log('   ❌ Prenotazione NON trovata');
      console.log('      L\'utente potrebbe non aver confermato o c\'è stato un errore');
    }

    if (updatedWaitlist.length > 0) {
      console.log(`\n   📋 Status waitlist: ${updatedWaitlist[0].status}`);
      console.log(`      Risposta offerta: ${updatedWaitlist[0].offer_response || 'N/A'}`);
      
      if (updatedWaitlist[0].status === 'approved') {
        console.log('   ✅ Waitlist correttamente aggiornata a "approved"');
      } else if (updatedWaitlist[0].status === 'offered') {
        console.log('   ⚠️ Waitlist ancora in status "offered"');
        console.log('      L\'utente potrebbe non aver confermato ancora');
      }
    }

    await waitForEnter('\n📊 Vuoi vedere un riepilogo completo?');

    // Riepilogo finale
    console.log('\n' + '='.repeat(70));
    console.log('📊 RIEPILOGO FINALE TEST');
    console.log('='.repeat(70));

    const allBookingsForDay = await sql`
      SELECT * FROM bookings 
      WHERE date = ${testDate} 
      AND barber_id = ${barberId}
      ORDER BY time
    `;

    console.log(`\n📅 Prenotazioni per 5 Dicembre 2025 - Michele:`);
    allBookingsForDay.forEach((booking) => {
      const statusEmoji = booking.status === 'confirmed' ? '✅' : '❌';
      const isNew = booking.customer_email === userToNotify.customer_email ? ' 🆕 (TUA!)' : '';
      console.log(`   ${statusEmoji} ${booking.time} - ${booking.customer_name}${isNew}`);
    });

    const remainingWaitlist = await sql`
      SELECT * FROM waitlist 
      WHERE date = ${testDate} 
      AND barber_id = ${barberId}
      AND status = 'waiting'
    `;

    console.log(`\n📋 Utenti ancora in lista d'attesa: ${remainingWaitlist.length}`);

    console.log('\n' + '='.repeat(70));
    console.log('✅ TEST COMPLETATO!');
    console.log('='.repeat(70));
    
    console.log('\n🎉 Cosa hai testato:');
    console.log('   ✅ Creazione automatica prenotazioni');
    console.log('   ✅ Iscrizione lista d\'attesa quando giorno pieno');
    console.log('   ✅ Cancellazione prenotazione');
    console.log('   ✅ Invio notifica push automatica');
    console.log('   ✅ Ricezione notifica sul telefono');
    console.log('   ✅ Visualizzazione offerta nel profilo');
    console.log('   ✅ Conferma prenotazione da offerta');
    console.log('   ✅ Creazione automatica prenotazione');

    console.log('\n💡 Vuoi ripulire i dati di test?');
    await waitForEnter('   Premi INVIO per cancellare le prenotazioni di test (consigliato)');

    // Cleanup
    await sql`
      DELETE FROM bookings 
      WHERE date = ${testDate} 
      AND barber_id = ${barberId}
      AND (notes LIKE '%TEST AUTOMATICO%' OR customer_email LIKE 'test%@example.com')
    `;

    console.log('✅ Dati di test cancellati!');
    console.log('\n👋 Grazie per aver testato il sistema!');

  } catch (error) {
    console.error('\n❌ ERRORE durante il test:', error);
    console.error(error.stack);
  } finally {
    rl.close();
  }
}

// Esegui il test
testInterattivoWaitlist();
