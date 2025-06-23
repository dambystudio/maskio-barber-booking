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

async function checkDatesConfiguration() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    console.log('\n🔍 Checking database structure and date configuration...');

    // Lista di tutte le tabelle
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📋 Available tables:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Controlla se esiste una tabella per la configurazione degli orari/slot
    const relevantTables = ['schedules', 'available_slots', 'time_slots', 'barber_schedules', 'working_hours'];
    
    for (const tableName of relevantTables) {
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tableName]);
      
      if (tableExists.rows[0].exists) {
        console.log(`\n✅ Found table: ${tableName}`);
        
        const count = await client.query(`SELECT COUNT(*) as total FROM ${tableName}`);
        console.log(`   Records: ${count.rows[0].total}`);
        
        // Mostra alcuni esempi di record
        const sample = await client.query(`SELECT * FROM ${tableName} LIMIT 3`);
        if (sample.rows.length > 0) {
          console.log('   Sample data:');
          sample.rows.forEach((row, index) => {
            console.log(`     ${index + 1}. ${JSON.stringify(row)}`);
          });
        }
      }
    }

    // Controlla le chiusure ricorrenti dei barbieri
    console.log('\n🔒 Checking barber closures...');
    
    const recurringClosures = await client.query('SELECT * FROM barber_recurring_closures');
    console.log(`Recurring closures: ${recurringClosures.rows.length}`);
    recurringClosures.rows.forEach(row => {
      console.log(`  - ${row.barber_email}: days ${row.closed_days}`);
    });

    const specificClosures = await client.query('SELECT * FROM barber_closures ORDER BY closure_date');
    console.log(`Specific closures: ${specificClosures.rows.length}`);
    specificClosures.rows.forEach(row => {
      console.log(`  - ${row.barber_email}: ${row.closure_date} (${row.closure_type})`);
    });

    // Controlla le chiusure generali
    console.log('\n🏪 Checking general closures...');
    
    const closureSettings = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'closure_settings'
      );
    `);
    
    if (closureSettings.rows[0].exists) {
      const generalClosures = await client.query('SELECT * FROM closure_settings');
      console.log(`General closure settings: ${generalClosures.rows.length}`);
      generalClosures.rows.forEach(row => {
        console.log(`  - Closed days: ${row.closed_days}`);
        console.log(`  - Closed dates: ${row.closed_dates}`);
      });
    } else {
      console.log('⚠️ No closure_settings table found');
    }

    // Test della generazione automatica di slot per un periodo
    console.log('\n🧪 Testing slot generation for next 7 days...');
    
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const testDate = new Date(today);
      testDate.setDate(today.getDate() + i);
      
      const year = testDate.getFullYear();
      const month = String(testDate.getMonth() + 1).padStart(2, '0');
      const day = String(testDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      console.log(`\n📅 Testing date: ${dateString} (${testDate.toLocaleDateString('it-IT', { weekday: 'long' })})`);
      
      // Test chiamata API interna per gli slot
      try {
        // Simula la logica di generateAllTimeSlots dell'API
        const dayOfWeek = testDate.getDay();
        let expectedSlots = [];
        
        if (dayOfWeek === 0) {
          // Domenica chiuso
          expectedSlots = [];
        } else if (dayOfWeek === 6) {
          // Sabato: 9:00-12:30, 15:00-17:30
          expectedSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
        } else {
          // Lunedì-Venerdì: 9:00-12:30, 15:00-19:00
          expectedSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'];
        }
        
        console.log(`   Expected slots: ${expectedSlots.length} (${expectedSlots.slice(0, 3).join(', ')}${expectedSlots.length > 3 ? '...' : ''})`);
        
      } catch (error) {
        console.log(`   ❌ Error generating slots: ${error.message}`);
      }
    }

    console.log('\n✅ Date configuration check completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
    console.log('\n🔚 Database connection closed');
  }
}

checkDatesConfiguration();
