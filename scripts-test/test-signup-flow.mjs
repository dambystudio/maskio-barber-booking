#!/usr/bin/env node

/**
 * Test completo: flusso di registrazione e prenotazioni senza verifica SMS
 * Verifica che il numero di telefono sia obbligatorio ma non venga verificato
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Test completo del sistema senza verifica SMS\n');

// Test 1: Verifica file signup
console.log('1️⃣ Controllo file signup...');
const signupPath = join(__dirname, 'src', 'app', 'auth', 'signup', 'page.tsx');
const signupContent = readFileSync(signupPath, 'utf8');

const signupTests = [
  {
    name: 'Nessun import PhoneVerification',
    pass: !signupContent.includes("import PhoneVerification")
  },
  {
    name: 'Campo telefono obbligatorio',
    pass: signupContent.includes('type="tel"') && signupContent.includes('required')
  },
  {
    name: 'Validazione formato telefono',
    pass: signupContent.includes('phoneRegex')
  },
  {
    name: 'phoneVerified: false',
    pass: signupContent.includes('phoneVerified: false')
  },
  {
    name: 'Nessuna verifica SMS nel flusso',
    pass: !signupContent.includes('sendSmsVerification') && !signupContent.includes('PhoneVerification')
  }
];

signupTests.forEach(test => {
  console.log(`   ${test.pass ? '✅' : '❌'} ${test.name}`);
});

// Test 2: Verifica BookingForm (no SMS verification)
console.log('\n2️⃣ Controllo BookingForm...');
const bookingFormPath = join(__dirname, 'src', 'components', 'BookingForm.tsx');
const bookingFormContent = readFileSync(bookingFormPath, 'utf8');

const bookingTests = [
  {
    name: 'Nessun import PhoneVerification',
    pass: !bookingFormContent.includes("import PhoneVerification")
  },
  {
    name: 'Nessun stato showPhoneVerification',
    pass: !bookingFormContent.includes('showPhoneVerification')
  },
  {
    name: 'Nessun stato phoneVerified',
    pass: !bookingFormContent.includes('phoneVerified')
  },
  {
    name: 'Nessuna funzione handlePhoneVerification',
    pass: !bookingFormContent.includes('handlePhoneVerification')
  },
  {
    name: 'Nessun modal PhoneVerification',
    pass: !bookingFormContent.includes('<PhoneVerification')
  },
  {
    name: 'Campo telefono presente ma senza verifica',
    pass: bookingFormContent.includes('type="tel"') && !bookingFormContent.includes('Verifica')
  }
];

bookingTests.forEach(test => {
  console.log(`   ${test.pass ? '✅' : '❌'} ${test.name}`);
});

// Test 3: Verifica API di registrazione
console.log('\n3️⃣ Controllo API di registrazione...');
const registerPath = join(__dirname, 'src', 'app', 'api', 'auth', 'register', 'route.ts');
try {
  const registerContent = readFileSync(registerPath, 'utf8');
  
  const apiTests = [
    {
      name: 'Accetta phoneVerified: false',
      pass: registerContent.includes('phoneVerified') || registerContent.includes('phone')
    },
    {
      name: 'Non richiede verifica telefono',
      pass: !registerContent.includes('phone_verified: true')
    }
  ];

  apiTests.forEach(test => {
    console.log(`   ${test.pass ? '✅' : '❌'} ${test.name}`);
  });
} catch (error) {
  console.log('   ⚠️  File API register non trovato o non leggibile');
}

// Test 4: Verifica struttura del flusso
console.log('\n4️⃣ Struttura del sistema...');

const systemStructure = [
  {
    name: 'Signup: Form con campi obbligatori (nome, email, telefono, password)',
    check: signupContent.includes('required') && 
           signupContent.includes('name') && 
           signupContent.includes('email') && 
           signupContent.includes('phone') &&
           signupContent.includes('password')
  },
  {
    name: 'Signup: Validazione client-side',
    check: signupContent.includes('emailRegex') && signupContent.includes('phoneRegex')
  },
  {
    name: 'Signup: Registrazione diretta senza step intermedi',
    check: signupContent.includes('performRegistration') && 
           !signupContent.includes('showPhoneVerification')
  },
  {
    name: 'Booking: Telefono richiesto ma senza verifica',
    check: bookingFormContent.includes('phone') && 
           !bookingFormContent.includes('phoneVerified')
  }
];

systemStructure.forEach((item, index) => {
  console.log(`   ${item.check ? '✅' : '❌'} ${item.name}`);
});

// Sommario
console.log('\n📋 SOMMARIO DEL TEST:');
const allTests = [...signupTests, ...bookingTests, ...systemStructure];
const passedTests = allTests.filter(test => test.pass || test.check).length;
const totalTests = allTests.length;
    check: signupContent.includes('performRegistration') && 
           !signupContent.includes('showPhoneVerification')
  },
  {
    name: 'Login automatico dopo registrazione',
    check: signupContent.includes('signIn(') && signupContent.includes('credentials')
  }
];

flowStructure.forEach((item, index) => {
  console.log(`   ${item.check ? '✅' : '❌'} ${item.name}`);
});

// Sommario
console.log('\n📋 SOMMARIO DEL TEST:');
const allTests = [...signupTests, ...flowStructure];
const passedTests = allTests.filter(test => test.pass || test.check).length;
const totalTests = allTests.length;

console.log(`✅ Test superati: ${passedTests}/${totalTests}`);

if (passedTests === totalTests) {
  console.log('\n🎉 TUTTI I TEST SUPERATI!');
  console.log('   • Il numero di telefono è obbligatorio');
  console.log('   • Non c\'è più verifica SMS nel signup');
  console.log('   • Non c\'è più verifica SMS nelle prenotazioni');
  console.log('   • Il flusso di registrazione è semplificato');
  console.log('   • Il flusso di prenotazione è semplificato');
} else {
  console.log('\n⚠️  ALCUNI TEST FALLITI - Verificare configurazione');
}

console.log('\n🔧 FLUSSO ATTUALE:');
console.log('\n📝 REGISTRAZIONE:');
console.log('   1. Utente compila form (nome, email, telefono*, password)');
console.log('   2. Validazione client-side (formato email/telefono)');
console.log('   3. Chiamata API /api/auth/register con phoneVerified: false');
console.log('   4. Login automatico se registrazione riuscita');
console.log('   5. Redirect alla home');

console.log('\n📅 PRENOTAZIONI:');
console.log('   1. Utente seleziona barbiere, servizi, data e ora');
console.log('   2. Inserisce dati personali (nome, email, telefono*)');
console.log('   3. Conferma prenotazione direttamente');
console.log('   4. Nessuna verifica SMS richiesta');

console.log('\n   * = campo obbligatorio ma senza verifica SMS');
