import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkSaturdaySchedules() {
  try {
    console.log('🔍 Controllo schedule del sabato...\n');
    
    // Trova tutti i barbieri
    const barbers = await sql`SELECT id, name FROM barbers ORDER BY name`;
    
    console.log(`👥 Barbieri trovati: ${barbers.map(b => b.name).join(', ')}\n`);
    
    for (const barber of barbers) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📋 ${barber.name.toUpperCase()} - Sabati`);
      console.log('='.repeat(60));
      
      // Trova i sabati
      const saturdays = await sql`
        SELECT date, available_slots, day_off
        FROM barber_schedules
        WHERE barber_id = ${barber.id}
        AND EXTRACT(DOW FROM date::date) = 6
        ORDER BY date ASC
        LIMIT 5
      `;
      
      if (saturdays.length === 0) {
        console.log('Nessun sabato trovato');
        continue;
      }
      
      saturdays.forEach((saturday, index) => {
        const slots = JSON.parse(saturday.available_slots);
        
        console.log(`\n${index + 1}. ${saturday.date}`);
        console.log(`   Day Off: ${saturday.day_off}`);
        console.log(`   Total Slots: ${slots.length}`);
        
        // Controlla 14:30
        const has1430 = slots.includes('14:30');
        console.log(`   ${has1430 ? '✅' : '❌'} 14:30: ${has1430 ? 'PRESENTE' : 'MANCANTE'}`);
        
        // Controlla 17:30
        const has1730 = slots.includes('17:30');
        console.log(`   ${has1730 ? '⚠️ ' : '✅'} 17:30: ${has1730 ? 'DA RIMUOVERE' : 'Corretto (assente)'}`);
        
        // Mostra tutti gli slot
        console.log(`   Slots:`, slots.join(', '));
      });
    }
    
    // Controlla appuntamenti esistenti alle 14:30 di sabato
    console.log(`\n\n${'='.repeat(60)}`);
    console.log('📅 APPUNTAMENTI ESISTENTI ALLE 14:30 (SABATO)');
    console.log('='.repeat(60));
    
    const bookings1430 = await sql`
      SELECT b.id, b.date, b.time, b.customer_name, br.name as barber_name
      FROM bookings b
      JOIN barbers br ON b.barber_id = br.id
      WHERE b.time = '14:30'
      AND EXTRACT(DOW FROM b.date::date) = 6
      AND b.status != 'cancelled'
      ORDER BY b.date ASC
    `;
    
    if (bookings1430.length > 0) {
      console.log(`\n✅ Trovati ${bookings1430.length} appuntamenti alle 14:30:`);
      bookings1430.forEach(b => {
        console.log(`   - ${b.date} ${b.time} | ${b.barber_name} | ${b.customer_name} (ID: ${b.id})`);
      });
    } else {
      console.log('\n❌ Nessun appuntamento alle 14:30 di sabato');
    }
    
    // Controlla appuntamenti esistenti alle 17:30 di sabato
    console.log(`\n\n${'='.repeat(60)}`);
    console.log('⚠️  APPUNTAMENTI DA ELIMINARE ALLE 17:30 (SABATO)');
    console.log('='.repeat(60));
    
    const bookings1730 = await sql`
      SELECT b.id, b.date, b.time, b.customer_name, b.customer_phone, br.name as barber_name
      FROM bookings b
      JOIN barbers br ON b.barber_id = br.id
      WHERE b.time = '17:30'
      AND EXTRACT(DOW FROM b.date::date) = 6
      AND b.status != 'cancelled'
      ORDER BY b.date ASC
    `;
    
    if (bookings1730.length > 0) {
      console.log(`\n⚠️  Trovati ${bookings1730.length} appuntamenti alle 17:30 da gestire:`);
      bookings1730.forEach(b => {
        console.log(`\n   📌 ${b.date} ${b.time}`);
        console.log(`      Barbiere: ${b.barber_name}`);
        console.log(`      Cliente: ${b.customer_name} (${b.customer_phone})`);
        console.log(`      ID: ${b.id}`);
      });
      console.log(`\n   💡 Questi appuntamenti dovrebbero essere spostati a 17:00 o cancellati`);
    } else {
      console.log('\n✅ Nessun appuntamento alle 17:30 di sabato');
    }
    
    console.log(`\n\n${'='.repeat(60)}`);
    console.log('📋 ORARI CORRETTI SABATO');
    console.log('='.repeat(60));
    console.log('Mattina: 9:00-12:30 (8 slot)');
    console.log('Pomeriggio: 14:30, 15:00, 15:30, 16:00, 16:30, 17:00 (6 slot)');
    console.log('❌ NO 17:30');
    console.log('Total: 14 slot');
    
  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

checkSaturdaySchedules();
