import { neon } from '@neondatabase/serverless';
import { readFileSync, writeFileSync } from 'fs';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

// CONFIGURAZIONE: Inserire qui la nuova email di Michele
const OLD_EMAIL = 'michelebiancofiore0230@gmail.com';
const NEW_EMAIL = 'NUOVA_EMAIL_MICHELE@DOMAIN.COM'; // <-- CAMBIARE QUI

async function changeicheleEmail() {
  console.log('🔄 Script per cambio email Michele');
  console.log(`📧 Cambio da: ${OLD_EMAIL}`);
  console.log(`📧 Cambio a:  ${NEW_EMAIL}`);
  console.log('\n⚠️  ATTENZIONE: Questo script modificherà database e file!');
  console.log('🛑 Assicurati di aver fatto backup prima di continuare.\n');

  try {
    // 1. AGGIORNAMENTO DATABASE
    console.log('1️⃣ Aggiornamento database...');
    
    // Aggiorna barber_recurring_closures
    const closuresUpdate = await sql`
      UPDATE barber_recurring_closures 
      SET barber_email = ${NEW_EMAIL}
      WHERE barber_email = ${OLD_EMAIL}
    `;
    console.log(`   ✅ Aggiornate ${closuresUpdate.length || 0} righe in barber_recurring_closures`);

    // Aggiorna barbers se contiene email reale
    const barbersUpdate = await sql`
      UPDATE barbers 
      SET email = ${NEW_EMAIL}
      WHERE email = ${OLD_EMAIL}
    `;
    console.log(`   ✅ Aggiornate ${barbersUpdate.length || 0} righe in barbers`);

    // Verifica aggiornamenti database
    const verifyClosures = await sql`
      SELECT * FROM barber_recurring_closures 
      WHERE barber_email = ${NEW_EMAIL}
    `;
    console.log(`   📊 Verificate ${verifyClosures.length} chiusure per la nuova email`);

    // 2. AGGIORNAMENTO FILE .ENV.LOCAL
    console.log('\n2️⃣ Aggiornamento .env.local...');
    
    try {
      const envPath = '.env.local';
      let envContent = readFileSync(envPath, 'utf8');
      
      if (envContent.includes(OLD_EMAIL)) {
        envContent = envContent.replace(OLD_EMAIL, NEW_EMAIL);
        writeFileSync(envPath, envContent);
        console.log('   ✅ File .env.local aggiornato');
      } else {
        console.log('   ⚠️  Email vecchia non trovata in .env.local');
      }
    } catch (error) {
      console.log('   ❌ Errore aggiornamento .env.local:', error.message);
    }

    // 3. LISTA FILE DA AGGIORNARE MANUALMENTE
    console.log('\n3️⃣ File da aggiornare manualmente:');
    
    const filesToUpdate = [
      'src/app/pannello-prenotazioni/page.tsx',
      'src/app/pannello-prenotazioni/page_new.tsx',
      'src/app/pannello-prenotazioni/page.tsx.backup2',
      'check-recurring-closures.mjs',
      'check-recurring-closures-correct.mjs',
      'add-thursday-closure-michele.mjs',
      'test-profile-api.mjs'
    ];

    filesToUpdate.forEach(file => {
      console.log(`   📝 ${file}`);
    });

    console.log('\n   🔍 Cercare e sostituire manualmente:');
    console.log(`      '${OLD_EMAIL}' -> '${NEW_EMAIL}'`);

    // 4. ISTRUZIONI POST-MIGRAZIONE
    console.log('\n4️⃣ Passi successivi:');
    console.log('   1. Aggiornare manualmente i file TypeScript/JavaScript elencati sopra');
    console.log('   2. Riavviare il server di sviluppo');
    console.log('   3. Chiedere a Michele di disconnettersi e riconnettersi');
    console.log('   4. Testare accesso al pannello prenotazioni');
    console.log('   5. Verificare che le chiusure di Michele siano ancora attive');
    console.log('   6. Testare creazione/modifica prenotazioni da parte di Michele');

    // 5. SCRIPT DI VERIFICA
    console.log('\n5️⃣ Test di verifica...');
    
    // Test autorizzazioni (simulato)
    const barberEmails = process.env.BARBER_EMAILS?.split(',') || [];
    if (barberEmails.includes(NEW_EMAIL)) {
      console.log('   ✅ Nuova email trovata in BARBER_EMAILS');
    } else {
      console.log('   ❌ Nuova email NON trovata in BARBER_EMAILS');
    }

    // Test API chiusure
    console.log('\n6️⃣ Test API chiusure...');
    try {
      const testResponse = await fetch(`http://localhost:3000/api/barber-recurring-closures/public?barberId=michele`);
      if (testResponse.ok) {
        const data = await testResponse.json();
        console.log('   ✅ API chiusure Michele funzionante');
        console.log(`   📊 ${data.length || 0} chiusure trovate`);
      } else {
        console.log('   ⚠️  API chiusures Michele non risponde (server offline?)');
      }
    } catch (error) {
      console.log('   ⚠️  Impossibile testare API (server offline?)');
    }

    console.log('\n🎉 Migrazione email completata!');
    console.log('📋 Ricorda di aggiornare manualmente i file TypeScript/JavaScript');

  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error);
    console.error('🔄 Verificare lo stato del database e riprovare');
  }
}

// ESECUZIONE SOLO SE EMAIL CONFIGURATA
if (NEW_EMAIL === 'NUOVA_EMAIL_MICHELE@DOMAIN.COM') {
  console.log('❌ ERRORE: Configurare prima NEW_EMAIL nello script!');
  console.log('📝 Modificare la riga:');
  console.log('   const NEW_EMAIL = "NUOVA_EMAIL_MICHELE@DOMAIN.COM";');
  console.log('   con la vera nuova email di Michele');
} else {
  changeicheleEmail();
}
