#!/usr/bin/env node

/**
 * Test script per verificare la funzionalità di prenotazione da parte dei barbieri
 * Verifica che i barbieri possano inserire manualmente i dati dei clienti
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 TEST: Verifica funzionalità prenotazione barbieri');
console.log('=' .repeat(60));

// Test 1: Verifica che la logica isBarber sia implementata
console.log('\n1️⃣ Controllo implementazione logica barbiere...');

const bookingFormPath = join(__dirname, 'src', 'components', 'BookingForm.tsx');

if (!fs.existsSync(bookingFormPath)) {
  console.error('❌ File BookingForm.tsx non trovato');
  process.exit(1);
}

const bookingFormContent = fs.readFileSync(bookingFormPath, 'utf8');

// Verifica presenza della logica isBarber
const checks = [  {
    name: 'Variabile isBarber definita',
    pattern: /const isBarber = userSession\?\?\.user\?\?\.role === 'barber' \|\| userSession\?\?\.user\?\?\.role === 'admin'/,
    required: true
  },
  {
    name: 'Inizializzazione campi vuoti per barbieri',
    pattern: /name: isBarber \? '' :/,
    required: true
  },  {
    name: 'Skip fetch profilo per barbieri',
    pattern: /if \(userSession\?\?\.user\?\?\.id && !isBarber\)/,
    required: true
  },
  {
    name: 'Validazione differenziata step 4',
    pattern: /if \(isBarber\) \{[\s\S]*?return formData\.customerInfo\.name &&[\s\S]*?formData\.customerInfo\.email &&[\s\S]*?formData\.customerInfo\.phone/,
    required: true
  },
  {
    name: 'Campi input per barbieri nel rendering',
    pattern: /\{isBarber \? \([\s\S]*?input[\s\S]*?name="name"/,
    required: true
  },
  {
    name: 'Sezione informativa per barbieri',
    pattern: /Modalità Barbiere Attiva/,
    required: true
  },
  {
    name: 'Titolo dinamico based su ruolo',
    pattern: /\{isBarber \? 'Riepilogo e Dati Cliente' : 'Riepilogo e Note Aggiuntive'\}/,
    required: true
  }
];

let passedChecks = 0;
const totalChecks = checks.length;

checks.forEach((check, index) => {
  const found = check.pattern.test(bookingFormContent);
  if (found) {
    console.log(`   ✅ ${check.name}`);
    passedChecks++;
  } else {
    console.log(`   ${check.required ? '❌' : '⚠️'} ${check.name}`);
    if (check.required) {
      console.log(`      Pattern ricercato: ${check.pattern}`);
    }
  }
});

console.log(`\n📊 Risultato controlli: ${passedChecks}/${totalChecks} superati`);

// Test 2: Verifica struttura form
console.log('\n2️⃣ Verifica struttura form...');

const formStructureChecks = [
  'handleCustomerInfoChange', // Handler per cambiare i dati cliente
  'customerInfo', // Oggetto dati cliente
  'name="name"', // Campo nome
  'name="email"', // Campo email  
  'name="phone"', // Campo telefono
  'required', // Attributi required sui campi
];

formStructureChecks.forEach(check => {
  if (bookingFormContent.includes(check)) {
    console.log(`   ✅ ${check} presente`);
  } else {
    console.log(`   ❌ ${check} mancante`);
  }
});

// Test 3: Verifica messaggi UX
console.log('\n3️⃣ Verifica messaggi UX...');

const uxChecks = [
  'Modalità Barbiere',
  'Inserisci manualmente',
  'Stai prenotando per un cliente',
  'Tutti i campi sono obbligatori'
];

uxChecks.forEach(check => {
  if (bookingFormContent.includes(check)) {
    console.log(`   ✅ "${check}" presente`);
  } else {
    console.log(`   ❌ "${check}" mancante`);
  }
});

// Test 4: Verifica logica condizionale
console.log('\n4️⃣ Verifica logica condizionale...');

// Controlla che ci siano controlli condizionali per isBarber
const conditionalChecks = [
  /if \(isBarber\)/, // Controlli if per barbieri
  /\? [\s\S]*? :/, // Operatori ternari 
  /isBarber &&/, // Controlli condizionali
];

conditionalChecks.forEach((pattern, index) => {
  const matches = bookingFormContent.match(new RegExp(pattern, 'g'));
  if (matches && matches.length > 0) {
    console.log(`   ✅ Logica condizionale ${index + 1}: ${matches.length} occorrenze`);
  } else {
    console.log(`   ❌ Logica condizionale ${index + 1}: non trovata`);
  }
});

// Riepilogo finale
console.log('\n' + '='.repeat(60));
if (passedChecks === totalChecks) {
  console.log('🎉 SUCCESSO: Tutte le funzionalità principali implementate!');
  console.log('\n✅ I barbieri possono ora:');
  console.log('   • Accedere al form di prenotazione');
  console.log('   • Inserire manualmente nome, email e telefono del cliente');
  console.log('   • Vedere campi di input invece di dati read-only');
  console.log('   • Ricevere validazione per tutti i campi obbligatori');
  console.log('   • Vedere messaggi UX appropriati per il loro ruolo');
  
  console.log('\n🔄 PROSSIMI PASSI CONSIGLIATI:');
  console.log('   1. Test manuale dell\'interfaccia');
  console.log('   2. Verifica funzionamento validazione');
  console.log('   3. Test completo del flusso di prenotazione');
  console.log('   4. Deploy delle modifiche');
  
} else {
  console.log(`⚠️ ATTENZIONE: ${totalChecks - passedChecks} controlli falliti`);
  console.log('   Alcuni aspetti potrebbero necessitare revisione');
}

console.log('\n📝 Note:');
console.log('   • Testare manualmente con account barbiere');
console.log('   • Verificare che i dati vengano salvati correttamente');
console.log('   • Controllare che email di conferma vengano inviate');

process.exit(passedChecks === totalChecks ? 0 : 1);
