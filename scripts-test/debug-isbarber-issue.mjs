#!/usr/bin/env node

/**
 * Script per diagnosticare il problema con isBarber nel BookingForm
 * Controlla se il valore di isBarber è calcolato correttamente
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function main() {
  log('cyan', '🔍 Debug isBarber Issue - Maskio Barber');
  log('cyan', '=====================================\n');

  try {
    // Leggi il file BookingForm.tsx
    const bookingFormPath = join(process.cwd(), 'src', 'components', 'BookingForm.tsx');
    const bookingFormContent = readFileSync(bookingFormPath, 'utf8');

    log('blue', '📄 Analisi BookingForm.tsx...\n');

    // 1. Controlla la definizione di isBarber
    const isBarberPattern = /const isBarber = (.+);/;
    const isBarberMatch = bookingFormContent.match(isBarberPattern);
    
    if (isBarberMatch) {
      log('green', '✅ Definizione isBarber trovata:');
      log('white', `   ${isBarberMatch[1]}`);
    } else {
      log('red', '❌ Definizione isBarber NON trovata!');
    }

    // 2. Controlla il controllo per "Modalità barbiere attiva"
    const modalitaBarbierePatter = /\{isBarber &&[\s\S]*?💼 Modalità Barbiere Attiva/;
    const modalitaBarbiere = bookingFormContent.match(modalitaBarbierePatter);
    
    if (modalitaBarbiere) {
      log('green', '✅ Controllo "Modalità barbiere attiva" trovato');
      log('white', '   Il testo dovrebbe apparire solo se isBarber === true');
    } else {
      log('red', '❌ Controllo "Modalità barbiere attiva" NON trovato!');
    }

    // 3. Cerca tutte le occorrenze di isBarber
    const isBarberMatches = bookingFormContent.match(/isBarber/g);
    log('blue', `📊 Numero totale di occorrenze "isBarber": ${isBarberMatches ? isBarberMatches.length : 0}`);

    // 4. Controlla se ci sono console.log per debug
    const consoleLogPattern = /console\.log.*isBarber/i;
    const hasDebugLog = consoleLogPattern.test(bookingFormContent);
    
    if (hasDebugLog) {
      log('yellow', '⚠️ Console.log debug già presente per isBarber');
    } else {
      log('blue', '💡 Suggerimento: Aggiungi console.log per debug isBarber');
    }

    // 5. Suggerimenti per il debug
    log('yellow', '\n🔧 Suggerimenti per risolvere il problema:');
    log('white', '1. Aggiungi console.log per verificare il valore di isBarber');
    log('white', '2. Controlla la sessione userSession in console');
    log('white', '3. Verifica che il ruolo utente sia corretto nel database');
    log('white', '4. Testa con utenti diversi (customer vs barber)');

    // 6. Controllo delle prop del componente
    const propsPattern = /interface BookingFormProps[\s\S]*?\}/;
    const propsMatch = bookingFormContent.match(propsPattern);
    
    if (propsMatch) {
      log('green', '\n✅ Interface BookingFormProps trovata:');
      log('white', propsMatch[0]);
    }

    log('green', '\n✅ Analisi completata!');

  } catch (error) {
    log('red', `❌ Errore durante l'analisi: ${error.message}`);
    process.exit(1);
  }
}

main();
