import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Configura il percorso del file .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env.local');

console.log('📁 Loading environment from:', envPath);
config({ path: envPath });

import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function testDailyUpdateSystem() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    console.log('\n🧪 TESTING DAILY UPDATE SYSTEM');
    console.log('=' .repeat(50));

    // 1. Controllo situazione attuale
    console.log('\n📊 Current situation:');
    
    const currentSchedules = await client.query(`
      SELECT 
        COUNT(*) as total,
        MIN(CAST(date AS DATE)) as earliest,
        MAX(CAST(date AS DATE)) as latest
      FROM barber_schedules
    `);
    
    console.log(`Current schedules: ${currentSchedules.rows[0].total}`);
    console.log(`Date range: ${currentSchedules.rows[0].earliest} to ${currentSchedules.rows[0].latest}`);

    // 2. Simula chiamata API daily-update
    console.log('\n🌅 Simulating daily update API call...');
    
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    try {
      // Simula l'URL della tua app in produzione
      const apiUrl = 'https://maskio-barber-booking-qag3bnk6n-davide-dambrosios-projects.vercel.app/api/system/daily-update';
      
      console.log(`📡 Making request to: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Daily update API response:');
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.error('❌ API call failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
      
    } catch (error) {
      console.error('❌ Error calling API:', error.message);
      console.log('🔄 Falling back to local simulation...');
      
      // Simula localmente la logica dell'API
      await simulateDailyUpdateLogic();
    }

    // 3. Verifica risultato
    console.log('\n📋 Checking result...');
    
    const newSchedules = await client.query(`
      SELECT 
        COUNT(*) as total,
        MIN(CAST(date AS DATE)) as earliest,
        MAX(CAST(date AS DATE)) as latest
      FROM barber_schedules
    `);
    
    console.log(`Schedules after update: ${newSchedules.rows[0].total}`);
    console.log(`New date range: ${newSchedules.rows[0].earliest} to ${newSchedules.rows[0].latest}`);
    
    const added = newSchedules.rows[0].total - currentSchedules.rows[0].total;
    console.log(`📈 Schedules added: ${added}`);

    // 4. Controlla specificamente oggi e i prossimi giorni
    console.log('\n📅 Checking next 7 days availability:');
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const checkDateString = checkDate.toISOString().split('T')[0];
      
      const daySchedules = await client.query(`
        SELECT barber_id, available_slots 
        FROM barber_schedules 
        WHERE date = $1
      `, [checkDateString]);
      
      const dayName = checkDate.toLocaleDateString('it-IT', { weekday: 'long' });
      
      if (daySchedules.rows.length > 0) {
        const totalSlots = daySchedules.rows.reduce((sum, row) => {
          return sum + JSON.parse(row.available_slots).length;
        }, 0);
        console.log(`  ${checkDateString} (${dayName}): ${daySchedules.rows.length} barbers, ${totalSlots} total slots`);
      } else {
        console.log(`  ${checkDateString} (${dayName}): ❌ NO SCHEDULES`);
      }
    }

    console.log('\n✅ Daily update system test completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
    console.log('\n🔚 Database connection closed');
  }
}

async function simulateDailyUpdateLogic() {
  console.log('🔄 Simulating daily update logic locally...');
  
  const barbers = await client.query('SELECT id FROM barbers WHERE is_active = true');
  console.log(`Found ${barbers.rows.length} active barbers`);
  
  const STANDARD_TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];
  
  const today = new Date();
  let addedCount = 0;
  
  // Aggiungi i prossimi 60 giorni se non esistono
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    
    // Salta le domeniche
    if (date.getDay() === 0) continue;
    
    for (const barber of barbers.rows) {
      const existing = await client.query(`
        SELECT id FROM barber_schedules 
        WHERE barber_id = $1 AND date = $2
      `, [barber.id, dateString]);
      
      if (existing.rows.length === 0) {
        await client.query(`
          INSERT INTO barber_schedules (barber_id, date, available_slots, unavailable_slots, day_off)
          VALUES ($1, $2, $3, $4, false)
        `, [barber.id, dateString, JSON.stringify(STANDARD_TIME_SLOTS), JSON.stringify([])]);
        addedCount++;
      }
    }
  }
  
  console.log(`✅ Local simulation added ${addedCount} schedules`);
}

testDailyUpdateSystem();
