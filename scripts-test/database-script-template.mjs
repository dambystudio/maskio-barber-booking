// Script di esempio sicuro per operazioni su database
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Carica le variabili d'ambiente dal file .env
dotenv.config();

// Verifica che le variabili d'ambiente necessarie siano definite
const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  console.error('❌ Errore: variabile d\'ambiente DATABASE_URL non trovata.');
  console.error('Crea un file .env nella root del progetto con la variabile DATABASE_URL.');
  process.exit(1);
}

// Inizializza la connessione al database
const sql = neon(DATABASE_URL);

async function main() {
  try {
    console.log('🔍 SCRIPT DI ESEMPIO SICURO\n');

    // Esegui query al database
    const result = await sql`SELECT COUNT(*) as count FROM users`;
    
    console.log(`👤 Numero totale di utenti: ${result[0].count}`);
    
    // Altre operazioni...
    
  } catch (error) {
    console.error('❌ Errore durante l\'esecuzione dello script:', error);
  }
}

// Esegui lo script
main().catch(console.error);
