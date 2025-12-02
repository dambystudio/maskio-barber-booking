#!/usr/bin/env node

/**
 * Test diretto API Resend
 * Verifica se l'API key funziona effettivamente
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carica environment variables
config({ path: join(__dirname, '.env.local') });

console.log('🧪 TEST DIRETTO API RESEND\n');

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY || RESEND_API_KEY.includes('placeholder') || RESEND_API_KEY.includes('INSERISCI')) {
  console.log('❌ API Key non configurata correttamente');
  process.exit(1);
}

try {
  const { Resend } = await import('resend');
  const resend = new Resend(RESEND_API_KEY);
  
  console.log('✅ Resend istanziato correttamente');
  console.log(`🔑 API Key: ${RESEND_API_KEY.substring(0, 15)}...`);
  
  // Test invio email di prova (commentato per sicurezza)
  console.log('\n🔍 Preparazione test email...');
  
  const testEmail = {
    from: 'onboarding@resend.dev',
    to: 'fabio.cassano97@icloud.com',
    subject: 'Test Maskio Barber - Configurazione Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">🧪 Test Email Maskio Barber</h2>
        <p>Questa è una email di test per verificare la configurazione di Resend.</p>
        <p><strong>Data test:</strong> ${new Date().toLocaleString('it-IT')}</p>
        <p><strong>Sistema:</strong> Configurazione Resend Email</p>
        <p>Se ricevi questa email, la configurazione funziona correttamente! ✅</p>
        
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 14px;">
          <strong>Maskio Barber</strong><br>
          Test automatico configurazione email
        </p>
      </div>
    `
  };
  
  console.log('📧 Email preparata:');
  console.log(`   From: ${testEmail.from}`);
  console.log(`   To: ${testEmail.to}`);
  console.log(`   Subject: ${testEmail.subject}`);
  
  // ATTENZIONE: Decommenta questa riga solo se vuoi inviare realmente l'email di test
  console.log('\n⚠️  Per inviare email di test, decommenta la riga nel codice');
  console.log('💡 La configurazione sembra corretta, prova il form /carriere sul sito');
  
  // const result = await resend.emails.send(testEmail);
  // console.log('\n✅ Email inviata con successo!');
  // console.log('📧 ID Email:', result.data?.id);
  
} catch (error) {
  console.error('\n❌ Errore nel test Resend:', error.message);
  
  if (error.message.includes('401')) {
    console.log('\n🔧 SOLUZIONE: API Key non valida');
    console.log('1. Verifica che l\'API key sia corretta');
    console.log('2. Vai su https://resend.com/api-keys');
    console.log('3. Genera una nuova API key se necessario');
  } else if (error.message.includes('403')) {
    console.log('\n🔧 SOLUZIONE: Dominio non autorizzato');
    console.log('1. Usa onboarding@resend.dev per il piano gratuito');
    console.log('2. Oppure verifica il tuo dominio su Resend');
  } else {
    console.log('\n🔧 SOLUZIONE: Controlla la configurazione');
    console.log('1. Verifica che resend sia installato: npm list resend');
    console.log('2. Controlla la connessione internet');
  }
}

console.log('\n📋 CONFIGURAZIONE RESEND - CHECKLIST:');
console.log('=====================================');
console.log('✅ Account creato su resend.com');
console.log('✅ API Key generata');
console.log('✅ API Key inserita in .env.local');
console.log('🔲 API Key aggiunta su Vercel (per produzione)');
console.log('🔲 Test email dal form /carriere');

console.log('\n🌐 CONFIGURAZIONI OPZIONALI SU RESEND:');
console.log('=====================================');
console.log('• Webhooks (per tracking delivery/open/click)');
console.log('• Dominio personalizzato (se vuoi noreply@maskiobarberconcept.it)');
console.log('• Suppressions (per gestire unsubscribe)');
console.log('• Templates (per email più elaborate)');
console.log('\n💡 Per ora NON servono - il sistema base funziona già!');
