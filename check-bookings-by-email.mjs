import { neon } from '@neondatabase/serverless';
import readline from 'readline';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

// Configura l'interfaccia per input CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function formatDate(dateString) {
  const date = new Date(dateString);
  const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                     'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  
  const dayName = dayNames[date.getDay()];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  
  return `${dayName} ${day} ${month} ${year}`;
}

function getStatusEmoji(status) {
  switch (status) {
    case 'confirmed': return '✅';
    case 'cancelled': return '❌';
    case 'pending': return '⏳';
    case 'completed': return '🏁';
    default: return '❓';
  }
}

function getStatusText(status) {
  switch (status) {
    case 'confirmed': return 'Confermata';
    case 'cancelled': return 'Cancellata';
    case 'pending': return 'In attesa';
    case 'completed': return 'Completata';
    default: return 'Sconosciuto';
  }
}

async function checkBookingsByEmail(email) {
  console.log(`\n🔍 Ricerca prenotazioni per: ${email}\n`);

  try {
    // 1. Cerca le prenotazioni
    const bookings = await sql`
      SELECT 
        id,
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
        notes,
        created_at,
        updated_at
      FROM bookings
      WHERE customer_email ILIKE ${email}
      ORDER BY date DESC, time DESC
    `;

    if (bookings.length === 0) {
      console.log('📭 Nessuna prenotazione trovata per questa email.');
      return;
    }

    console.log(`📊 Trovate ${bookings.length} prenotazioni:\n`);

    // 2. Raggruppa per stato
    const bookingsByStatus = bookings.reduce((acc, booking) => {
      if (!acc[booking.status]) acc[booking.status] = [];
      acc[booking.status].push(booking);
      return acc;
    }, {});

    // 3. Mostra statistiche
    console.log('📈 Riepilogo:');
    Object.entries(bookingsByStatus).forEach(([status, statusBookings]) => {
      const emoji = getStatusEmoji(status);
      const text = getStatusText(status);
      console.log(`   ${emoji} ${text}: ${statusBookings.length} prenotazioni`);
    });

    // 4. Calcola statistiche economiche (solo prenotazioni confermate/completate)
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
    const totalSpent = confirmedBookings.reduce((sum, booking) => sum + (parseFloat(booking.price) || 0), 0);
    const totalDuration = confirmedBookings.reduce((sum, booking) => sum + (parseInt(booking.duration) || 0), 0);

    if (confirmedBookings.length > 0) {
      console.log(`\n💰 Statistiche economiche:`);
      console.log(`   💵 Totale speso: €${totalSpent.toFixed(2)}`);
      console.log(`   ⏱️ Tempo totale servizi: ${totalDuration} minuti (${Math.round(totalDuration/60)} ore)`);
      console.log(`   📊 Prezzo medio: €${(totalSpent/confirmedBookings.length).toFixed(2)}`);
    }

    // 5. Mostra dettagli di ogni prenotazione
    console.log(`\n📋 Dettaglio prenotazioni:\n`);
    console.log('='.repeat(80));

    bookings.forEach((booking, index) => {
      const statusEmoji = getStatusEmoji(booking.status);
      const statusText = getStatusText(booking.status);
      const formattedDate = formatDate(booking.date);
      const isUpcoming = new Date(booking.date) > new Date() && booking.status === 'confirmed';
      
      console.log(`\n${index + 1}. ${statusEmoji} Prenotazione ${booking.id.slice(0, 8)}... ${isUpcoming ? '🔮 PROSSIMA' : ''}`);
      console.log(`   👤 Cliente: ${booking.customer_name}`);
      console.log(`   📧 Email: ${booking.customer_email}`);
      console.log(`   📱 Telefono: ${booking.customer_phone || 'Non fornito'}`);
      console.log(`   ✂️ Barbiere: ${booking.barber_name} (${booking.barber_id})`);
      console.log(`   💇 Servizio: ${booking.service}`);
      console.log(`   💰 Prezzo: €${booking.price}`);
      console.log(`   📅 Data: ${formattedDate}`);
      console.log(`   🕐 Orario: ${booking.time}`);
      console.log(`   ⏱️ Durata: ${booking.duration} minuti`);
      console.log(`   📊 Stato: ${statusEmoji} ${statusText}`);
      
      if (booking.notes) {
        console.log(`   📝 Note: ${booking.notes}`);
      }
      
      console.log(`   📅 Creata: ${new Date(booking.created_at).toLocaleDateString('it-IT')} ${new Date(booking.created_at).toLocaleTimeString('it-IT')}`);
      
      if (booking.updated_at !== booking.created_at) {
        console.log(`   🔄 Aggiornata: ${new Date(booking.updated_at).toLocaleDateString('it-IT')} ${new Date(booking.updated_at).toLocaleTimeString('it-IT')}`);
      }
      
      console.log('   ' + '-'.repeat(78));
    });

    // 6. Controlla se l'utente ha anche account registrato
    console.log(`\n👤 Controllo account utente:\n`);
    
    const userAccount = await sql`
      SELECT name, email, phone, emailVerified, created_at, updated_at
      FROM users
      WHERE email ILIKE ${email}
    `;

    if (userAccount.length > 0) {
      const user = userAccount[0];
      console.log(`✅ Account registrato trovato:`);
      console.log(`   👤 Nome: ${user.name || 'Non specificato'}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   📱 Telefono: ${user.phone || 'Non specificato'}`);
      console.log(`   ✉️ Email verificata: ${user.emailVerified ? 'Sì' : 'No'}`);
      console.log(`   📅 Registrato: ${new Date(user.created_at).toLocaleDateString('it-IT')}`);
    } else {
      console.log(`📭 Nessun account registrato trovato (solo prenotazioni come ospite)`);
    }

    // 7. Prossime prenotazioni
    const upcomingBookings = bookings.filter(b => 
      new Date(b.date) > new Date() && b.status === 'confirmed'
    );

    if (upcomingBookings.length > 0) {
      console.log(`\n🔮 Prossime prenotazioni (${upcomingBookings.length}):\n`);
      upcomingBookings.forEach((booking, index) => {
        const formattedDate = formatDate(booking.date);
        const daysUntil = Math.ceil((new Date(booking.date) - new Date()) / (1000 * 60 * 60 * 24));
        console.log(`   ${index + 1}. ${formattedDate} alle ${booking.time} con ${booking.barber_name}`);
        console.log(`      💇 ${booking.service} - €${booking.price} (tra ${daysUntil} giorni)`);
      });
    }

  } catch (error) {
    console.error('❌ Errore durante la ricerca:', error);
  }
}

// Funzione principale per gestire l'input CLI
function askForEmail() {
  rl.question('\n📧 Inserisci l\'email da cercare (o "exit" per uscire): ', async (email) => {
    if (email.toLowerCase() === 'exit') {
      console.log('\n👋 Arrivederci!');
      rl.close();
      return;
    }

    if (!email || !email.includes('@')) {
      console.log('❌ Email non valida. Inserisci un\'email corretta.');
      askForEmail();
      return;
    }

    await checkBookingsByEmail(email.trim());
    
    // Chiedi se vuole cercare un'altra email
    rl.question('\n🔄 Vuoi cercare un\'altra email? (s/n): ', (answer) => {
      if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sì' || answer.toLowerCase() === 'si') {
        askForEmail();
      } else {
        console.log('\n👋 Arrivederci!');
        rl.close();
      }
    });
  });
}

// Avvia lo script
console.log('🔍 VERIFICA PRENOTAZIONI PER EMAIL');
console.log('=====================================');
console.log('Questo script ti permette di cercare tutte le prenotazioni associate a un\'email.');
console.log('Digita "exit" per uscire in qualsiasi momento.\n');

askForEmail();
