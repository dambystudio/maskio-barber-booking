#!/usr/bin/env node

/**
 * Test configurazione Resend Email
 * Verifica se Resend è configurato correttamente
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carica environment variables
config({ path: join(__dirname, '.env.local') });

console.log('📧 TEST CONFIGURAZIONE RESEND EMAIL\n');

// Test 1: Verifica Environment Variables
console.log('1️⃣ Environment Variables:');
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL;

console.log(`   RESEND_API_KEY presente: ${!!RESEND_API_KEY ? '✅' : '❌'}`);
console.log(`   FROM_EMAIL presente: ${!!FROM_EMAIL ? '✅' : '❌'}`);

if (RESEND_API_KEY) {
  console.log(`   RESEND_API_KEY format: ${RESEND_API_KEY.startsWith('re_') ? '✅ Corretto (re_...)' : '❌ Formato errato'}`);
  console.log(`   RESEND_API_KEY (primi 10 char): ${RESEND_API_KEY.substring(0, 10)}...`);
} else {
  console.log('   ❌ RESEND_API_KEY mancante!');
}

if (FROM_EMAIL) {
  console.log(`   FROM_EMAIL: ${FROM_EMAIL}`);
  console.log(`   FROM_EMAIL domain: ${FROM_EMAIL.includes('@maskiobarberconcept.it') ? '✅ Dominio corretto' : '⚠️  Dominio diverso'}`);
}

// Test 2: Verifica installazione package
console.log('\n2️⃣ Package Resend:');
try {
  const { Resend } = await import('resend');
  console.log('   ✅ Package resend installato');
  
  if (RESEND_API_KEY && RESEND_API_KEY !== 're_TUA_API_KEY_QUI' && RESEND_API_KEY !== 're_your_api_key_here') {
    const resend = new Resend(RESEND_API_KEY);
    console.log('   ✅ Istanza Resend creata');
    
    // Test 3: Verifica API Key (senza inviare email)
    console.log('\n3️⃣ Test API Key:');
    try {
      // Nota: Questo test NON invia email, verifica solo l'API key
      console.log('   🔍 Verifico validità API key...');
      
      // Il test di validità richiede una chiamata API reale
      // Per ora verifichiamo solo il formato
      if (RESEND_API_KEY.length > 20 && RESEND_API_KEY.startsWith('re_')) {
        console.log('   ✅ Formato API Key valido');
      } else {
        console.log('   ❌ Formato API Key non valido');
      }
      
    } catch (error) {
      console.log(`   ❌ Errore API Key: ${error.message}`);
    }
  } else {
    console.log('   ⚠️  API Key è un placeholder - Configura una chiave reale');
  }
  
} catch (error) {
  console.log('   ❌ Package resend non installato o errore import');
  console.log(`   Errore: ${error.message}`);
}

// Test 4: Verifica configurazione completa
console.log('\n4️⃣ Diagnosi Configurazione:');

const issues = [];
const suggestions = [];

if (!RESEND_API_KEY || RESEND_API_KEY === 're_TUA_API_KEY_QUI' || RESEND_API_KEY === 're_your_api_key_here') {
  issues.push('RESEND_API_KEY non configurato o è un placeholder');
  suggestions.push('1. Vai su https://resend.com/api-keys');
  suggestions.push('2. Crea una nuova API key');
  suggestions.push('3. Sostituisci il valore in .env.local');
}

if (!FROM_EMAIL || FROM_EMAIL === 'noreply@maskiobarberconcept.it') {
  if (!FROM_EMAIL) {
    issues.push('FROM_EMAIL non configurato');
  }
  suggestions.push('4. Configura FROM_EMAIL con un indirizzo verificato su Resend');
}

if (issues.length === 0) {
  console.log('   ✅ Configurazione sembra corretta!');
  console.log('\n💡 Per testare l\'invio reale:');
  console.log('   1. Vai su /carriere nel browser');
  console.log('   2. Compila il form di candidatura');
  console.log('   3. Controlla i log di Vercel per eventuali errori');
} else {
  console.log('   ❌ Problemi trovati:');
  issues.forEach(issue => console.log(`      • ${issue}`));
  
  console.log('\n🔧 Soluzioni:');
  suggestions.forEach(suggestion => console.log(`   ${suggestion}`));
}

console.log('\n📝 CHECKLIST RESEND:');
console.log('□ Account Resend creato su https://resend.com');
console.log('□ API Key generato e copiato');
console.log('□ RESEND_API_KEY aggiornato in .env.local');
console.log('□ RESEND_API_KEY aggiunto su Vercel (Environment Variables)');
console.log('□ FROM_EMAIL configurato (deve essere verificato su Resend)');
console.log('□ Package resend installato (npm install resend)');
console.log('□ Test invio email dalla pagina /carriere');

console.log('\n🌐 CONFIGURAZIONE VERCEL:');
console.log('Per aggiungere le variabili su Vercel:');
console.log('1. vercel.com/dashboard → tuo progetto → Settings → Environment Variables');
console.log('2. Aggiungi: RESEND_API_KEY, FROM_EMAIL');
console.log('3. Redeploy il progetto');
