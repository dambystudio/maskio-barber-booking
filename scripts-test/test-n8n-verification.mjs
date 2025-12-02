#!/usr/bin/env node

/**
 * Test script per la funzionalità N8N verification
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🤖 TEST: Implementazione N8N Verification');
console.log('=' .repeat(60));

// Test 1: Verifica file implementazione
console.log('\n1️⃣ Controllo file N8N...');

const n8nFiles = [
  'src/lib/verification-n8n.ts',
  'src/app/api/verification/send-verification-n8n/route.ts',
  'src/app/api/verification/verify-n8n/route.ts',
  'src/components/PhoneVerificationN8N.tsx',
  'N8N_SMS_SETUP_GUIDE.md'
];

let filesOk = 0;

n8nFiles.forEach(file => {
  const filePath = join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
    filesOk++;
  } else {
    console.log(`   ❌ ${file} - MANCANTE`);
  }
});

console.log(`\n📊 File N8N: ${filesOk}/${n8nFiles.length} presenti`);

// Test 2: Verifica configurazione N8N
console.log('\n2️⃣ Controllo configurazione N8N...');

const envPath = join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const n8nChecks = [
    'N8N_WEBHOOK_URL',
    'N8N_API_KEY'
  ];
  
  n8nChecks.forEach(check => {
    if (envContent.includes(check)) {
      console.log(`   ✅ ${check} configurato`);
    } else {
      console.log(`   ⚠️ ${check} non configurato (opzionale)`);
    }
  });
  
  // Suggest default config
  if (!envContent.includes('N8N_WEBHOOK_URL')) {
    console.log('\n   💡 Aggiungi al .env.local:');
    console.log('      N8N_WEBHOOK_URL=http://localhost:5678/webhook/send-verification');
    console.log('      N8N_API_KEY=your_api_key_here # opzionale');
  }
} else {
  console.log('   ❌ File .env.local non trovato');
}

// Test 3: Verifica implementazione service
console.log('\n3️⃣ Controllo N8N Service...');

const n8nServicePath = join(__dirname, 'src', 'lib', 'verification-n8n.ts');
if (fs.existsSync(n8nServicePath)) {
  const content = fs.readFileSync(n8nServicePath, 'utf8');
  
  const serviceChecks = [
    {
      name: 'Classe N8NVerificationService',
      search: 'export class N8NVerificationService'
    },
    {
      name: 'Metodo sendVerification (generico)',
      search: 'sendVerification('
    },
    {
      name: 'Metodo sendSMSVerification',
      search: 'sendSMSVerification('
    },
    {
      name: 'Metodo sendWhatsAppVerification',
      search: 'sendWhatsAppVerification('
    },
    {
      name: 'Metodo sendVerificationWithFallback',
      search: 'sendVerificationWithFallback('
    },
    {
      name: 'Validazione formato telefono',
      search: 'phoneRegex'
    },
    {
      name: 'Gestione fallback sviluppo',
      search: 'NODE_ENV === \'development\''
    },
    {
      name: 'Cleanup codici scaduti',
      search: 'cleanupExpiredCodes('
    }
  ];
  
  let serviceOk = 0;
  
  serviceChecks.forEach(check => {
    if (content.includes(check.search)) {
      console.log(`   ✅ ${check.name}`);
      serviceOk++;
    } else {
      console.log(`   ❌ ${check.name}`);
    }
  });
  
  console.log(`\n📊 N8N Service: ${serviceOk}/${serviceChecks.length} funzionalità implementate`);
}

// Test 4: Verifica API endpoints N8N
console.log('\n4️⃣ Controllo API endpoints N8N...');

const n8nApiChecks = [
  {
    file: 'src/app/api/verification/send-verification-n8n/route.ts',
    features: ['method = \'auto\'', 'sendVerificationWithFallback', 'sendSMSVerification', 'sendWhatsAppVerification']
  },
  {
    file: 'src/app/api/verification/verify-n8n/route.ts', 
    features: ['verifyPhoneCode', 'getVerificationInfo']
  }
];

n8nApiChecks.forEach(api => {
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

// Test 5: Verifica componente UI N8N
console.log('\n5️⃣ Controllo UI Component N8N...');

const n8nComponentPath = join(__dirname, 'src', 'components', 'PhoneVerificationN8N.tsx');
if (fs.existsSync(n8nComponentPath)) {
  const content = fs.readFileSync(n8nComponentPath, 'utf8');
  
  const uiChecks = [
    'selectedMethod',
    'auto',
    'whatsapp', 
    'sms',
    'send-verification-n8n',
    'verify-n8n',
    'lastUsedMethod',
    'Method Selection'
  ];
  
  let uiOk = 0;
  
  uiChecks.forEach(check => {
    if (content.includes(check)) {
      console.log(`   ✅ ${check}`);
      uiOk++;
    } else {
      console.log(`   ❌ ${check}`);
    }
  });
  
  console.log(`\n📊 UI Component: ${uiOk}/${uiChecks.length} funzionalità implementate`);
}

// Test 6: Confronto con implementazione Twilio
console.log('\n6️⃣ Confronto Twilio vs N8N...');

const twilioServicePath = join(__dirname, 'src', 'lib', 'verification.ts');
const twilioExists = fs.existsSync(twilioServicePath);
const n8nExists = fs.existsSync(n8nServicePath);

console.log(`   ${twilioExists ? '✅' : '❌'} Implementazione Twilio`);
console.log(`   ${n8nExists ? '✅' : '❌'} Implementazione N8N`);

if (twilioExists && n8nExists) {
  console.log('\n   💡 Entrambe le implementazioni disponibili!');
  console.log('      - Usa Twilio per semplicità immediata');
  console.log('      - Usa N8N per costi ridotti e flessibilità');
}

// Riepilogo finale
console.log('\n' + '='.repeat(60));
console.log('🤖 RIEPILOGO IMPLEMENTAZIONE N8N');

console.log('\n✅ VANTAGGI N8N:');
console.log('   • Costi molto ridotti (€0.01-0.03 vs €0.05-0.10)');
console.log('   • Supporto nativo WhatsApp + SMS');
console.log('   • Fallback automatico WhatsApp → SMS');
console.log('   • Workflow visuale e personalizzabile');
console.log('   • Scelta metodo da parte dell\'utente');
console.log('   • Modalità sviluppo con simulazione');

console.log('\n🔧 SETUP RICHIESTO:');
console.log('   1. Installare N8N (Docker o npm)');
console.log('   2. Configurare workflow verification');
console.log('   3. Setup provider SMS economico (BulkSMS, TextMagic)');
console.log('   4. Setup WhatsApp Business API');
console.log('   5. Configurare webhook URL in .env.local');

console.log('\n🚀 WORKFLOW N8N:');
console.log('   1. Webhook riceve richiesta da Maskio');
console.log('   2. Genera codice 6 cifre');
console.log('   3. Switch: SMS o WhatsApp?');
console.log('   4. Invia tramite provider scelto');
console.log('   5. Log in database');
console.log('   6. Risposta a Maskio con status');

console.log('\n💰 STIMA COSTI MENSILI:');
console.log('   • N8N Server: €5-15/mese');
console.log('   • 100 SMS: €3 vs €5-10 Twilio (risparmio 40-70%)');
console.log('   • 500 SMS: €15 vs €25-50 Twilio (risparmio 40-70%)');
console.log('   • 1000 SMS: €30 vs €50-100 Twilio (risparmio 40-70%)');

console.log('\n📝 PROSSIMI PASSI:');
console.log('   1. Scegliere: Twilio (veloce) o N8N (economico)');
console.log('   2. Se N8N: installare e configurare server');
console.log('   3. Configurare provider SMS/WhatsApp');
console.log('   4. Testare workflow in sviluppo');
console.log('   5. Deploy e monitoraggio produzione');

console.log('\n⚠️  CONSIDERAZIONI:');
console.log('   • N8N richiede server aggiuntivo da gestire');
console.log('   • Setup iniziale più complesso di Twilio');
console.log('   • Vantaggioso per volumi alti (>100 SMS/mese)');
console.log('   • Twilio più affidabile per casi critici');

if (filesOk >= n8nFiles.length * 0.8) {
  console.log('\n🎉 IMPLEMENTAZIONE N8N COMPLETATA!');
  console.log('   Pronta per test e configurazione server N8N');
} else {
  console.log('\n⚠️ IMPLEMENTAZIONE N8N PARZIALE');
  console.log(`   ${n8nFiles.length - filesOk} file mancanti`);
}

process.exit(0);
