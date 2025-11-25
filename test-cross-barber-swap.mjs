#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

console.log('🧪 TEST CROSS-BARBER SWAP FUNCTIONALITY\n');

async function runTests() {
  try {
    // TEST 1: Verifica nomi barbieri nel database
    console.log('📋 TEST 1: Verifica nomi barbieri');
    console.log('━'.repeat(50));
    
    const barbers = await sql`
      SELECT id, name, email, is_active
      FROM barbers
      ORDER BY name
    `;
    
    console.log(`✅ Barbieri trovati: ${barbers.length}\n`);
    barbers.forEach(b => {
      console.log(`   ID: ${b.id}`);
      console.log(`   Nome: "${b.name}"`);
      console.log(`   Email: ${b.email}`);
      console.log(`   Attivo: ${b.is_active}`);
      console.log('');
    });

    // TEST 2: Verifica prenotazioni esistenti per ogni barbiere
    console.log('\n📋 TEST 2: Prenotazioni per barbiere (prossimi 7 giorni)');
    console.log('━'.repeat(50));
    
    const today = new Date();
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    
    for (const barber of barbers) {
      const bookings = await sql`
        SELECT 
          id,
          barber_name,
          customer_name,
          date,
          time,
          service as service_name,
          status
        FROM bookings
        WHERE barber_name = ${barber.name}
        AND date >= ${today.toISOString().split('T')[0]}
        AND date <= ${oneWeekLater.toISOString().split('T')[0]}
        AND status != 'cancelled'
        ORDER BY date, time
        LIMIT 5
      `;
      
      console.log(`\n💈 ${barber.name} (${barber.email})`);
      console.log(`   Prenotazioni trovate: ${bookings.length}`);
      
      if (bookings.length > 0) {
        bookings.forEach(b => {
          console.log(`   - ${b.date} ${b.time} | ${b.customer_name} | ${b.service_name} | ${b.status}`);
        });
      } else {
        console.log(`   ⚠️  Nessuna prenotazione nei prossimi 7 giorni`);
      }
    }

    // TEST 3: Verifica case sensitivity dei nomi
    console.log('\n\n📋 TEST 3: Case Sensitivity Check');
    console.log('━'.repeat(50));
    
    const allBookings = await sql`
      SELECT DISTINCT barber_name
      FROM bookings
      WHERE status != 'cancelled'
      ORDER BY barber_name
    `;
    
    console.log(`\nNomi barbieri UNIVOCI nelle prenotazioni: ${allBookings.length}`);
    allBookings.forEach(b => {
      console.log(`   - "${b.barber_name}"`);
      
      // Confronto con i nomi dei barbieri
      const matchedBarber = barbers.find(barber => barber.name === b.barber_name);
      if (matchedBarber) {
        console.log(`     ✅ Match esatto con barbiere ID: ${matchedBarber.id}`);
      } else {
        console.log(`     ❌ NESSUN MATCH ESATTO!`);
        
        // Prova case-insensitive
        const caseInsensitiveMatch = barbers.find(
          barber => barber.name.toLowerCase() === b.barber_name.toLowerCase()
        );
        if (caseInsensitiveMatch) {
          console.log(`     ⚠️  Match case-insensitive con: "${caseInsensitiveMatch.name}"`);
        }
      }
    });

    // TEST 4: Simulazione API call
    console.log('\n\n📋 TEST 4: Simulazione fetch bookings API');
    console.log('━'.repeat(50));
    
    const apiBookings = await sql`
      SELECT 
        id,
        barber_id,
        barber_name,
        customer_name,
        customer_phone,
        date,
        time,
        service as service_name,
        status
      FROM bookings
      WHERE date >= ${today.toISOString().split('T')[0]}
      AND status != 'cancelled'
      ORDER BY date, time
      LIMIT 20
    `;
    
    console.log(`\nPrenotazioni future trovate: ${apiBookings.length}\n`);
    
    // Raggruppa per barbiere
    const byBarber = {};
    apiBookings.forEach(b => {
      if (!byBarber[b.barber_name]) {
        byBarber[b.barber_name] = [];
      }
      byBarber[b.barber_name].push(b);
    });
    
    Object.keys(byBarber).forEach(barberName => {
      console.log(`💈 ${barberName}: ${byBarber[barberName].length} prenotazioni`);
      byBarber[barberName].slice(0, 3).forEach(b => {
        console.log(`   - ${b.date} ${b.time} | ${b.customer_name}`);
      });
    });

    // TEST 5: Verifica slot specifici
    console.log('\n\n📋 TEST 5: Verifica slot occupati oggi');
    console.log('━'.repeat(50));
    
    const todayStr = today.toISOString().split('T')[0];
    
    for (const barber of barbers) {
      const todayBookings = await sql`
        SELECT time, customer_name, service as service_name
        FROM bookings
        WHERE barber_name = ${barber.name}
        AND date = ${todayStr}
        AND status != 'cancelled'
        ORDER BY time
      `;
      
      console.log(`\n💈 ${barber.name} - ${todayStr}`);
      if (todayBookings.length > 0) {
        console.log(`   Slot occupati: ${todayBookings.length}`);
        todayBookings.forEach(b => {
          console.log(`   🔴 ${b.time} - ${b.customer_name}`);
        });
      } else {
        console.log(`   ✅ Tutti gli slot disponibili (nessuna prenotazione)`);
      }
    }

    // TEST 6: Verifica disponibilità API endpoint
    console.log('\n\n📋 TEST 6: Test logica disponibilità slot');
    console.log('━'.repeat(50));
    
    const testDate = todayStr;
    const testTime = '10:00';
    
    for (const barber of barbers) {
      const occupied = await sql`
        SELECT id, customer_name
        FROM bookings
        WHERE barber_name = ${barber.name}
        AND date = ${testDate}
        AND time = ${testTime}
        AND status != 'cancelled'
      `;
      
      console.log(`\n${barber.name} - ${testDate} ${testTime}:`);
      if (occupied.length > 0) {
        console.log(`   ❌ Occupato da: ${occupied[0].customer_name} (ID: ${occupied[0].id})`);
      } else {
        console.log(`   ✅ Disponibile`);
      }
    }

    console.log('\n\n' + '═'.repeat(50));
    console.log('✅ TEST COMPLETATI');
    console.log('═'.repeat(50));

  } catch (error) {
    console.error('❌ Errore durante i test:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();
