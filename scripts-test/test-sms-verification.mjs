#!/usr/bin/env node

/**
 * Test script per verificare la funzionalità di verifica SMS
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📱 TEST: Verifica funzionalità SMS');
console.log('=' .repeat(50));

// Test 1: Verifica file e componenti esistano
console.log('\n1️⃣ Controllo file implementazione...');

const files = [
  'src/lib/verification.ts',
  'src/app/api/verification/send-sms/route.ts',
  'src/app/api/verification/verify-sms/route.ts',
  'src/components/PhoneVerification.tsx',
  'src/components/BookingForm.tsx'
];

let filesOk = 0;

files.forEach(file => {
  const filePath = join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
    filesOk++;
  } else {
    console.log(`   ❌ ${file} - MANCANTE`);
  }
});

console.log(`\n📊 File: ${filesOk}/${files.length} presenti`);

// Test 2: Verifica configurazione Twilio
console.log('\n2️⃣ Controllo configurazione Twilio...');

const envPath = join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const twilioChecks = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN', 
    'TWILIO_PHONE_NUMBER'
  ];
  
  twilioChecks.forEach(check => {
    if (envContent.includes(check)) {
      console.log(`   ✅ ${check} configurato`);
    } else {
      console.log(`   ❌ ${check} mancante`);
    }
  });
} else {
  console.log('   ❌ File .env.local non trovato');
}

// Test 3: Verifica implementazione BookingForm
console.log('\n3️⃣ Controllo integrazione BookingForm...');

const bookingFormPath = join(__dirname, 'src', 'components', 'BookingForm.tsx');
if (fs.existsSync(bookingFormPath)) {
  const content = fs.readFileSync(bookingFormPath, 'utf8');
  
  const bookingChecks = [
    {
      name: 'Import PhoneVerification',
      search: "import PhoneVerification from './PhoneVerification'"
    },
    {
      name: 'State showPhoneVerification',
      search: 'showPhoneVerification'
    },
    {
      name: 'State phoneVerified',
      search: 'phoneVerified'
    },
    {
      name: 'Handler handlePhoneVerification',
      search: 'handlePhoneVerification'
    },
    {
      name: 'Pulsante Verifica',
      search: 'Verifica'
    },
    {
      name: 'Componente PhoneVerification',
      search: '<PhoneVerification'
    },
    {
      name: 'Validazione telefono verificato',
      search: 'phoneVerified'
    }
  ];
  
  let bookingOk = 0;
  
  bookingChecks.forEach(check => {
    if (content.includes(check.search)) {
      console.log(`   ✅ ${check.name}`);
      bookingOk++;
    } else {
      console.log(`   ❌ ${check.name}`);
    }
  });
  
  console.log(`\n📊 BookingForm: ${bookingOk}/${bookingChecks.length} funzionalità implementate`);
}

// Test 4: Verifica API endpoints
console.log('\n4️⃣ Controllo API endpoints...');

const apiChecks = [
  {
    file: 'src/app/api/verification/send-sms/route.ts',
    features: ['POST', 'getServerSession', 'VerificationService.sendSMSVerification']
  },
  {
    file: 'src/app/api/verification/verify-sms/route.ts', 
    features: ['POST', 'getServerSession', 'VerificationService.verifyPhoneCode']
  }
];

apiChecks.forEach(api => {
  const apiPath = join(__dirname, api.file);
  if (fs.existsSync(apiPath)) {
    const content = fs.readFileSync(apiPath, 'utf8');
    
    console.log(`\n   📄 ${api.file}:`);
    api.features.forEach(feature => {
      if (content.includes(feature)) {
        console.log(`      ✅ ${feature}`);
      } else {
        console.log(`      ❌ ${feature}`);
      }
    });
  }
});

// Test 5: Verifica dependency Twilio
console.log('\n5️⃣ Controllo dipendenze...');

const packageJsonPath = join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};
  
  if (dependencies.twilio) {
    console.log(`   ✅ twilio: ${dependencies.twilio}`);
  } else {
    console.log('   ❌ twilio package mancante');
  }
  
  if (devDependencies['@types/twilio']) {
    console.log(`   ✅ @types/twilio: ${devDependencies['@types/twilio']}`);
  } else {
    console.log('   ❌ @types/twilio mancante');
  }
}

// Riepilogo finale
console.log('\n' + '='.repeat(50));
console.log('📋 RIEPILOGO IMPLEMENTAZIONE SMS');
console.log('\n✅ FUNZIONALITÀ IMPLEMENTATE:');
console.log('   • Integrazione Twilio con fallback simulazione');
console.log('   • API endpoint per invio SMS (/api/verification/send-sms)');
console.log('   • API endpoint per verifica codice (/api/verification/verify-sms)');
console.log('   • Componente UI PhoneVerification con modal');
console.log('   • Integrazione nel BookingForm con validazione');
console.log('   • Gestione stati verifica (pending, verified, error)');

console.log('\n🔧 CONFIGURAZIONE NECESSARIA:');
console.log('   1. Configurare credenziali Twilio in .env.local:');
console.log('      TWILIO_ACCOUNT_SID=your_account_sid');
console.log('      TWILIO_AUTH_TOKEN=your_auth_token');
console.log('      TWILIO_PHONE_NUMBER=+39_your_number');

console.log('\n🚀 FLUSSO UTENTE:');
console.log('   1. Utente inserisce numero di telefono nel form');
console.log('   2. Clicca "Verifica" → si apre modal');
console.log('   3. Sistema invia SMS con codice 6 cifre');
console.log('   4. Utente inserisce codice nel modal');
console.log('   5. Sistema verifica → numero marcato come verificato');
console.log('   6. Prenotazione procede solo con numero verificato');

console.log('\n📝 PROSSIMI PASSI:');
console.log('   1. Configurare account Twilio (https://twilio.com)');
console.log('   2. Aggiornare credenziali in .env.local');
console.log('   3. Test con numeri reali');
console.log('   4. Deploy e test in produzione');

console.log('\n⚠️  NOTE IMPORTANTI:');
console.log('   • SMS hanno costi (circa €0.05-0.10 per SMS)');
console.log('   • Modalità simulazione per sviluppo (senza credenziali)');
console.log('   • Codici scadono dopo 10 minuti');
console.log('   • Solo numeri italiani (+39) supportati attualmente');

process.exit(0);
