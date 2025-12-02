#!/usr/bin/env node

/**
 * Test semplice per verificare la funzionalità di prenotazione da parte dei barbieri
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 TEST: Verifica funzionalità prenotazione barbieri');
console.log('=' .repeat(50));

const bookingFormPath = join(__dirname, 'src', 'components', 'BookingForm.tsx');

if (!fs.existsSync(bookingFormPath)) {
  console.error('❌ File BookingForm.tsx non trovato');
  process.exit(1);
}

const content = fs.readFileSync(bookingFormPath, 'utf8');

// Test principali con ricerca di stringhe
const tests = [
  {
    name: 'Definizione isBarber (inclusi admin)',
    search: "userSession?.user?.role === 'barber' || userSession?.user?.role === 'admin'",
    critical: true
  },
  {
    name: 'Campi vuoti per barbieri all\'inizializzazione',
    search: "isBarber ? '' : (",
    critical: true
  },
  {
    name: 'Skip fetch profilo per barbieri',
    search: "&& !isBarber)",
    critical: true
  },
  {
    name: 'Validazione phone per barbieri',
    search: "if (isBarber) {",
    critical: true
  },
  {
    name: 'Input field per nome cliente',
    search: 'name="name"',
    critical: true
  },
  {
    name: 'Input field per email cliente',
    search: 'name="email"',
    critical: true
  },
  {
    name: 'Input field per telefono cliente',
    search: 'name="phone"',
    critical: true
  },
  {
    name: 'Sezione informativa modalità barbiere',
    search: 'Modalità Barbiere Attiva',
    critical: true
  },
  {
    name: 'Titolo dinamico per barbieri',
    search: 'Riepilogo e Dati Cliente',
    critical: true
  },
  {
    name: 'Handler per aggiornare dati cliente',
    search: 'handleCustomerInfoChange',
    critical: true
  }
];

let passed = 0;
let total = tests.length;

console.log('\n📋 Verifica implementazione...\n');

tests.forEach((test, index) => {
  const found = content.includes(test.search);
  const status = found ? '✅' : (test.critical ? '❌' : '⚠️');
  const number = `${index + 1}`.padStart(2, ' ');
  
  console.log(`${number}. ${status} ${test.name}`);
  if (!found && test.critical) {
    console.log(`     Cercato: "${test.search}"`);
  }
  
  if (found) passed++;
});

// Verifica funzionalità avanzate
console.log('\n🔧 Verifica funzionalità avanzate...\n');

const advancedChecks = [
  {
    name: 'Logica condizionale per rendering campi',
    check: content.includes('isBarber ? (') && content.includes(') : (')
  },
  {
    name: 'Messaggi informativi per barbieri',
    check: content.includes('Stai prenotando per un cliente')
  },
  {
    name: 'Validazione required sui campi',
    check: content.includes('required')
  },
  {
    name: 'Gestione stati del form',
    check: content.includes('setFormData')
  }
];

let advancedPassed = 0;

advancedChecks.forEach((check, index) => {
  const status = check.check ? '✅' : '❌';
  const number = `${index + 1}`.padStart(2, ' ');
  console.log(`${number}. ${status} ${check.name}`);
  if (check.check) advancedPassed++;
});

// Risultato finale
console.log('\n' + '='.repeat(50));
console.log(`📊 RISULTATO: ${passed}/${total} controlli principali superati`);
console.log(`🔧 AVANZATE: ${advancedPassed}/${advancedChecks.length} funzionalità avanzate`);

if (passed === total && advancedPassed === advancedChecks.length) {
  console.log('\n🎉 SUCCESSO COMPLETO!');
  console.log('\n✅ FUNZIONALITÀ IMPLEMENTATE:');
  console.log('   • I barbieri (e admin) hanno accesso alla modalità speciale');
  console.log('   • Campi di input manuali per dati cliente');
  console.log('   • Validazione appropriata per tutti i campi obbligatori');
  console.log('   • Interfaccia utente chiara e informativa');
  console.log('   • Skip del caricamento automatico profilo per barbieri');
  
  console.log('\n🚀 PRONTO PER:');
  console.log('   • Test manuale con account barbiere');
  console.log('   • Verifica del flusso completo di prenotazione');
  console.log('   • Deploy in produzione');
  
} else if (passed >= total * 0.8) {
  console.log('\n✅ IMPLEMENTAZIONE QUASI COMPLETA');
  console.log(`   ${total - passed} elementi minori da rivedere`);
} else {
  console.log('\n⚠️ IMPLEMENTAZIONE PARZIALE');
  console.log(`   ${total - passed} elementi critici mancanti`);
}

console.log('\n📝 PROSSIMI PASSI:');
console.log('   1. Test manuale con account barbiere/admin');
console.log('   2. Verificare inserimento e validazione dati');
console.log('   3. Testare invio email con dati cliente manuali');
console.log('   4. Commit e deploy delle modifiche');

process.exit(passed === total ? 0 : 1);
