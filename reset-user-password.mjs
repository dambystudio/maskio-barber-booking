import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL);

async function resetUserPassword() {
  console.log('🔐 RESET PASSWORD UTENTE');
  console.log('=========================\n');

  // Email dell'utente da modificare
  const userEmail = 'prova@gmail.com'; // MODIFICA QUI L'EMAIL
  
  // Genera una password temporanea sicura
  const temporaryPassword = crypto.randomBytes(4).toString('hex').toUpperCase(); // Es: A1B2C3D4
  
  try {
    // 1. Verifica che l'utente esista
    console.log('🔍 1. Verificando utente esistente...');
    const existingUser = await sql`
      SELECT id, name, email, role 
      FROM users 
      WHERE email = ${userEmail}
    `;

    if (existingUser.length === 0) {
      console.log('❌ Utente non trovato con email:', userEmail);
      return;
    }

    const user = existingUser[0];
    console.log(`✅ Utente trovato: ${user.name} (${user.email}) - Ruolo: ${user.role}`);

    // 2. Backup hash attuale (solo per riferimento - NON recuperabile)
    console.log('\n📋 2. Backup hash attuale...');
    const currentHashInfo = await sql`
      SELECT password 
      FROM users 
      WHERE email = ${userEmail}
    `;
    
    const currentHash = currentHashInfo[0]?.password;
    console.log(`💾 Hash attuale: ${currentHash ? currentHash.substring(0, 20) + '...' : 'Nessuna password'}`);
    console.log('⚠️  NOTA: Questo hash rappresenta una password che sarà PERSA per sempre');

    // 3. Genera nuovo hash
    console.log('\n🔒 3. Generando nuova password temporanea...');
    const newHash = await bcrypt.hash(temporaryPassword, 12);
    console.log(`🎲 Password temporanea: ${temporaryPassword}`);
    console.log(`🔒 Nuovo hash: ${newHash.substring(0, 20)}...`);

    // 4. Aggiorna database
    console.log('\n💾 4. Aggiornando database...');
    await sql`
      UPDATE users 
      SET password = ${newHash}
      WHERE email = ${userEmail}
    `;
    console.log('✅ Password aggiornata nel database');

    // 5. Verifica aggiornamento
    console.log('\n🧪 5. Verificando aggiornamento...');
    const isValid = await bcrypt.compare(temporaryPassword, newHash);
    console.log(`✅ Test password: ${isValid ? 'SUCCESSO' : 'FALLITO'}`);

    // 6. Istruzioni finali
    console.log('\n📋 ISTRUZIONI FINALI:');
    console.log('====================================');
    console.log(`👤 Utente: ${user.name} (${user.email})`);
    console.log(`🔑 Password temporanea: ${temporaryPassword}`);
    console.log(`📅 Data reset: ${new Date().toLocaleString('it-IT')}`);
    console.log('');
    console.log('📞 COMUNICARE ALL\'UTENTE:');
    console.log(`"La tua password è stata resettata. Usa: ${temporaryPassword}"`);
    console.log('"Ti consigliamo di cambiarla subito dal tuo profilo."');
    console.log('');
    console.log('⚠️  IMPORTANTE:');
    console.log('• La password originale è PERSA per sempre');
    console.log('• Non è possibile ripristinarla');
    console.log('• L\'utente deve cambiare questa password temporanea');

  } catch (error) {
    console.error('\n❌ ERRORE DURANTE IL RESET:', error);
  }
}

// Esegui la funzione
resetUserPassword().catch(console.error); 