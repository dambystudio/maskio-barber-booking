import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function checkUserSession() {
  console.log('🔍 VERIFICA STATO UTENTE E SESSIONE');
  console.log('===================================\n');

  try {
    const testEmail = 'prova@gmail.com';
    
    // 1. Verifica stato nel database
    console.log('📊 1. STATO NEL DATABASE:');
    const dbUser = await sql`
      SELECT id, name, email, role, phone, created_at, "emailVerified"
      FROM users 
      WHERE email = ${testEmail}
    `;

    if (dbUser.length === 0) {
      console.log('❌ Utente non trovato nel database!');
      return;
    }

    const user = dbUser[0];
    console.log(`   👤 Nome: ${user.name}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🏷️ Ruolo DB: ${user.role}`);
    console.log(`   📱 Telefono: ${user.phone}`);
    console.log(`   ✅ Email verificata: ${user.emailVerified ? 'SÌ' : 'NO'}`);
    console.log(`   📅 Creato: ${user.created_at}`);

    // 2. Verifica configurazione variabili d'ambiente
    console.log('\n⚙️ 2. CONFIGURAZIONE VARIABILI D\'AMBIENTE:');
    const barberEmails = process.env.BARBER_EMAILS?.split(',').map(email => email.trim()) || [];
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    
    console.log(`   📧 BARBER_EMAILS: "${process.env.BARBER_EMAILS || 'NON DEFINITA'}"`);
    console.log(`   👑 ADMIN_EMAILS: "${process.env.ADMIN_EMAILS || 'NON DEFINITA'}"`);
    console.log(`   🧔 Email in BARBER_EMAILS: ${barberEmails.includes(testEmail) ? 'SÌ' : 'NO'}`);
    console.log(`   👑 Email in ADMIN_EMAILS: ${adminEmails.includes(testEmail) ? 'SÌ' : 'NO'}`);

    // 3. Simula logica di determinazione ruolo (come fa auth.ts)
    console.log('\n🎯 3. LOGICA DETERMINAZIONE RUOLO:');
    const isBarber = barberEmails.includes(testEmail);
    const isAdmin = adminEmails.includes(testEmail);
    
    let expectedRole = 'customer'; // default
    if (isAdmin) {
      expectedRole = 'admin';
    } else if (isBarber) {
      expectedRole = 'barber';
    }

    console.log(`   🎲 Ruolo atteso da variabili d'ambiente: ${expectedRole}`);
    console.log(`   💾 Ruolo attuale nel DB: ${user.role}`);
    console.log(`   ⚖️ Corrispondenza: ${expectedRole === user.role ? '✅ SÌ' : '❌ NO'}`);

    // 4. Raccomandazioni
    console.log('\n💡 4. DIAGNOSI E SOLUZIONI:');
    
    if (user.role === 'barber' && !isBarber) {
      console.log('   ⚠️ PROBLEMA IDENTIFICATO:');
      console.log('   • Il ruolo nel DB è "barber"');
      console.log('   • Ma l\'email NON è nelle variabili d\'ambiente BARBER_EMAILS');
      console.log('   • Il sistema auth.ts sovrascriverà il ruolo a "customer"');
      console.log('');
      console.log('   🔧 SOLUZIONI:');
      console.log('   A) Aggiungi prova@gmail.com a BARBER_EMAILS in .env.local');
      console.log('   B) Oppure modifica auth.ts per non sovrascrivere ruoli esistenti');
      console.log('');
      console.log('   📝 Per soluzione A, aggiungi a .env.local:');
      console.log(`   BARBER_EMAILS="${barberEmails.length > 0 ? barberEmails.join(',') + ',' : ''}prova@gmail.com"`);
    } else if (user.role === 'barber' && isBarber) {
      console.log('   ✅ CONFIGURAZIONE CORRETTA:');
      console.log('   • Ruolo nel DB: barber');
      console.log('   • Email in BARBER_EMAILS: SÌ');
      console.log('   • Il problema potrebbe essere cache della sessione');
      console.log('');
      console.log('   🔧 PROVA:');
      console.log('   1. Logout completo');
      console.log('   2. Chiudi browser');
      console.log('   3. Riapri e fai login di nuovo');
    } else {
      console.log('   📋 Stato normale - account cliente');
    }

    // 5. Test API di debug
    console.log('\n🧪 5. SUGGERIMENTI DI TEST:');
    console.log('   • Fai logout e login di nuovo');
    console.log('   • Controlla /api/debug/check-permissions dopo login');
    console.log('   • Verifica console browser per errori durante login');

  } catch (error) {
    console.error('\n❌ ERRORE DURANTE LA VERIFICA:', error);
  }
}

// Esegui la funzione
checkUserSession().catch(console.error); 