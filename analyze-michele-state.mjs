import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function analyzeMicheleCurrentState() {
  console.log('🔍 ANALISI STATO ATTUALE - MICHELE NEL SISTEMA\n');

  try {
    // 1. CONFIGURAZIONE AUTORIZZAZIONI
    console.log('1️⃣ Configurazione autorizzazioni (.env):');
    const barberEmails = process.env.BARBER_EMAILS?.split(',') || [];
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    
    console.log(`   📧 BARBER_EMAILS: ${process.env.BARBER_EMAILS}`);
    console.log(`   📧 ADMIN_EMAILS: ${process.env.ADMIN_EMAILS}`);
    
    const micheleInBarbers = barberEmails.some(email => email.includes('michele'));
    console.log(`   ✅ Michele presente in BARBER_EMAILS: ${micheleInBarbers ? 'SI' : 'NO'}`);

    // 2. STATO DATABASE - BARBIERI
    console.log('\n2️⃣ Stato database - Tabella barbers:');
    const barbers = await sql`
      SELECT id, name, email, phone, is_active 
      FROM barbers 
      WHERE id = 'michele' OR name ILIKE '%michele%' OR email ILIKE '%michele%'
      ORDER BY id
    `;
    
    if (barbers.length > 0) {
      barbers.forEach(barber => {
        console.log(`   👨‍💼 ID: ${barber.id}`);
        console.log(`       Nome: ${barber.name}`);
        console.log(`       Email: ${barber.email}`);
        console.log(`       Telefono: ${barber.phone || 'N/A'}`);
        console.log(`       Attivo: ${barber.is_active}`);
        console.log('   ---');
      });
    } else {
      console.log('   ❌ Nessun barbiere con nome/ID "michele" trovato');
    }

    // 3. CHIUSURE RICORRENTI
    console.log('\n3️⃣ Chiusure ricorrenti di Michele:');
    const micheleClosures = await sql`
      SELECT * FROM barber_recurring_closures 
      WHERE barber_email ILIKE '%michele%'
      ORDER BY barber_email
    `;
    
    if (micheleClosures.length > 0) {
      micheleClosures.forEach(closure => {
        console.log(`   📅 Email: ${closure.barber_email}`);
        try {
          const closedDays = JSON.parse(closure.closed_days);
          const dayNames = closedDays.map(day => 
            ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'][day]
          );
          console.log(`       Giorni chiusi: ${dayNames.join(', ')}`);
        } catch {
          console.log(`       Giorni chiusi (raw): ${closure.closed_days}`);
        }
        console.log(`       Creato da: ${closure.created_by || 'N/A'}`);
        console.log(`       Creato il: ${closure.created_at}`);
        console.log('   ---');
      });
    } else {
      console.log('   ❌ Nessuna chiusura ricorrente trovata per Michele');
    }    // 4. PRENOTAZIONI RECENTI
    console.log('\n4️⃣ Prenotazioni di Michele:');
    const recentBookings = await sql`
      SELECT 
        customer_name, 
        date as booking_date, 
        time as booking_time, 
        service as service_name, 
        status,
        created_at
      FROM bookings 
      WHERE barber_name ILIKE '%michele%' 
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    if (recentBookings.length > 0) {
      console.log(`   📋 Trovate ${recentBookings.length} prenotazioni recenti:`);      recentBookings.forEach(booking => {
        console.log(`   • ${booking.booking_date} ${booking.booking_time} - ${booking.customer_name}`);
        console.log(`     Servizio: ${booking.service_name} | Status: ${booking.status}`);
      });    } else {
      console.log('   📭 Nessuna prenotazione trovata per Michele');
    }

    // 5. UTENTI MICHELE NEL SISTEMA
    console.log('\n5️⃣ Utenti con nome Michele nel sistema:');
    const micheleUsers = await sql`
      SELECT id, name, email, role, created_at
      FROM users 
      WHERE name ILIKE '%michele%' OR email ILIKE '%michele%'
      ORDER BY created_at DESC
    `;
    
    if (micheleUsers.length > 0) {
      micheleUsers.forEach(user => {
        console.log(`   👤 ID: ${user.id}`);
        console.log(`      Nome: ${user.name}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Ruolo: ${user.role}`);
        console.log(`      Creato: ${user.created_at}`);
        console.log('   ---');
      });
    } else {
      console.log('   👤 Nessun utente "Michele" trovato nella tabella users');
    }

    // 6. TEST API (se server è attivo)
    console.log('\n6️⃣ Test API (se server attivo):');
    try {
      // Test API chiusure Michele
      const closuresResponse = await fetch('http://localhost:3000/api/barber-recurring-closures/public?barberId=michele');
      if (closuresResponse.ok) {
        const data = await closuresResponse.json();
        console.log(`   ✅ API chiusure Michele: ${data.length || 0} chiusure trovate`);
      } else {
        console.log(`   ⚠️  API chiusure Michele: ${closuresResponse.status}`);
      }

      // Test API slots Michele per oggi
      const today = new Date().toISOString().split('T')[0];
      const slotsResponse = await fetch(`http://localhost:3000/api/bookings/slots?barberId=michele&date=${today}`);
      if (slotsResponse.ok) {
        const slots = await slotsResponse.json();
        const availableSlots = slots.filter(slot => slot.available);
        console.log(`   ✅ API slots Michele (${today}): ${availableSlots.length} slot disponibili`);
      } else {
        console.log(`   ⚠️  API slots Michele: ${slotsResponse.status}`);
      }
    } catch (error) {
      console.log('   🔴 Server non attivo o irraggiungibile');
    }

    // 7. ANALISI COERENZA
    console.log('\n7️⃣ Analisi coerenza configurazione:');
    
    const emailInEnv = barberEmails.find(email => email.includes('michele'));
    const emailInDB = micheleClosures.length > 0 ? micheleClosures[0].barber_email : null;
    const barberInDB = barbers.length > 0 ? barbers[0].email : null;

    console.log(`   📧 Email in .env: ${emailInEnv || 'NON TROVATA'}`);
    console.log(`   📧 Email in chiusure: ${emailInDB || 'NON TROVATA'}`);
    console.log(`   📧 Email in barbers: ${barberInDB || 'NON TROVATA'}`);

    if (emailInEnv && emailInDB && emailInEnv === emailInDB) {
      console.log('   ✅ Configurazione coerente');
    } else {
      console.log('   ⚠️  ATTENZIONE: Configurazione non coerente!');
      console.log('       Le email non corrispondono tra .env e database');
    }

    // 8. RACCOMANDAZIONI
    console.log('\n8️⃣ Raccomandazioni:');
    
    if (!micheleInBarbers) {
      console.log('   🔴 CRITICO: Michele non è configurato come barbiere in .env.local');
    }
    
    if (barbers.length === 0) {
      console.log('   🔴 CRITICO: Michele non esiste nella tabella barbers');
    }
    
    if (micheleClosures.length === 0) {
      console.log('   ⚠️  Michele non ha chiusure ricorrenti configurate');
    }
    
    if (emailInEnv && emailInDB && emailInEnv !== emailInDB) {
      console.log('   🔴 CRITICO: Email non coerenti tra .env e database');
      console.log('       Usare migrate-michele-email.mjs per sincronizzare');
    }

    console.log('\n✅ Analisi completata!');

  } catch (error) {
    console.error('❌ Errore durante l\'analisi:', error);
  }
}

analyzeMicheleCurrentState();
