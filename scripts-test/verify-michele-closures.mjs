// Script per verificare le chiusure mattutine di Michele
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

// Carica manualmente le variabili d'ambiente dal file .env
function loadEnv() {
  try {
    const envContent = readFileSync('.env', 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=').replace(/^['"](.*)['"]$/, '$1');
        process.env[key] = value;
      }
    }
  } catch (error) {
    console.error('❌ Errore nel caricamento del file .env:', error.message);
  }
}

async function verifyMicheleClosures() {
  console.log('🔍 Verifica chiusure mattutine per Michele...');
  
  // Carica le variabili d'ambiente
  loadEnv();
  
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL non trovato nelle variabili d\'ambiente');
    }

    const sql = neon(process.env.DATABASE_URL);
    
    console.log('📊 Connesso al database, verifica in corso...');
    
    const result = await sql`
      SELECT id, closure_date, closure_type, reason, created_by, created_at
      FROM barber_closures 
      WHERE barber_email = 'michele' 
        AND closure_type = 'morning'
        AND closure_date IN ('2025-09-01', '2025-09-08', '2025-09-15', '2025-09-22', '2025-09-29')
      ORDER BY closure_date;
    `;
    
    if (result.length === 0) {
      console.log('❌ Nessuna chiusura trovata per Michele!');
    } else {
      console.log(`✅ Trovate ${result.length} chiusure mattutine per Michele:`);
      console.log('\n📋 Dettagli:');
      result.forEach(row => {
        const formattedDate = new Date(row.closure_date + 'T00:00:00').toLocaleDateString('it-IT');
        console.log(`- ${formattedDate} (${row.closure_date}): ${row.closure_type}`);
        console.log(`  Motivo: ${row.reason}`);
        console.log(`  Creato da: ${row.created_by}`);
        console.log(`  ID: ${row.id}`);
        console.log('');
      });
    }
    
    console.log('\n🎉 Verifica completata!');
    
  } catch (error) {
    console.error('❌ Errore durante la verifica:', error.message);
  }
}

// Esegui lo script
verifyMicheleClosures();
