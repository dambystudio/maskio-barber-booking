import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function promoteProvaToBarber() {
  console.log('🔄 PROMOZIONE ACCOUNT A BARBIERE');
  console.log('=================================\n');

  try {
    const testEmail = 'prova@gmail.com';
    
    // 1. Verifica che l'account esista
    console.log('🔍 1. Verificando account esistente...');
    const existingUser = await sql`
      SELECT id, name, email, role 
      FROM users 
      WHERE email = ${testEmail}
    `;

    if (existingUser.length === 0) {
      console.log('❌ Account non trovato! Esegui prima create-prova-account.mjs');
      return;
    }

    const user = existingUser[0];
    console.log(`✅ Account trovato: ${user.name} (${user.email}) - Ruolo attuale: ${user.role}`);

    // 2. Promuovi a barbiere
    console.log('\n🔄 2. Promuovendo a barbiere...');
    
    await sql`
      UPDATE users 
      SET role = 'barber'
      WHERE email = ${testEmail}
    `;

    console.log('✅ Ruolo aggiornato a "barber"');

    // 3. Verifica finale
    console.log('\n🔍 3. Verifica finale...');
    const updatedUser = await sql`
      SELECT id, name, email, role, phone 
      FROM users 
      WHERE email = ${testEmail}
    `;

    if (updatedUser.length > 0) {
      const finalUser = updatedUser[0];
      console.log(`\n🎉 ACCOUNT PROMOSSO CON SUCCESSO:`);
      console.log(`   👤 Nome: ${finalUser.name}`);
      console.log(`   📧 Email: ${finalUser.email}`);
      console.log(`   🏷️ Nuovo Ruolo: ${finalUser.role}`);

      console.log(`\n🔑 CREDENZIALI BARBIERE:`);
      console.log(`   Email: prova@gmail.com`);
      console.log(`   Password: prova123`);
      
      console.log(`\n🎯 COSA PUOI TESTARE ORA:`);
      console.log(`   ✅ Login come barbiere`);
      console.log(`   ✅ Accesso al /pannello-prenotazioni`);
      console.log(`   ✅ Visualizzazione prenotazioni`);
      console.log(`   ✅ Gestione stato prenotazioni`);
      console.log(`   ✅ Contatto clienti via WhatsApp/telefono`);
      console.log(`   ✅ Navigation bar con "Pannello" invece di "Prenota"`);
      
      console.log(`\n🔗 LINK UTILI:`);
      console.log(`   - Login: /auth/signin`);
      console.log(`   - Pannello: /pannello-prenotazioni`);
      console.log(`   - Area personale: /area-personale`);

    } else {
      console.log(`❌ ERRORE: Account non trovato dopo la promozione`);
    }

  } catch (error) {
    console.error('\n❌ ERRORE DURANTE LA PROMOZIONE:', error);
  }
}

// Esegui la funzione
promoteProvaToBarber().catch(console.error); 