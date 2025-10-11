import bcrypt from 'bcryptjs';

async function generatePasswordHash() {
  console.log('🔐 GENERAZIONE HASH PASSWORD TEMPORANEA');
  console.log('======================================\n');

  const temporaryPassword = 'ziopera';
  
  try {
    // Genera l'hash con lo stesso round usato dall'app (12)
    const hash = await bcrypt.hash(temporaryPassword, 12);
    
    console.log('📝 Password da hashare:', temporaryPassword);
    console.log('🔒 Hash generato:', hash);
    console.log('');
    console.log('📋 ISTRUZIONI:');
    console.log('1. Copia l\'hash generato');
    console.log('2. Aggiorna il campo "password" nel database con questo hash');
    console.log('3. L\'utente potrà loggarsi con password "ziopera"');
    console.log('');
    console.log('⚠️  IMPORTANTE:');
    console.log('• La password originale sarà PERSA per sempre');
    console.log('• Se vuoi ripristinarla, devi conoscere la password originale in plain text');
    console.log('• L\'hash originale non può essere "decrittato"');
    
    // Test del hash
    console.log('\n🧪 TEST HASH:');
    const isValid = await bcrypt.compare(temporaryPassword, hash);
    console.log(`✅ Il hash è valido: ${isValid}`);
    
  } catch (error) {
    console.error('❌ Errore nella generazione hash:', error);
  }
}

// Esegui la funzione
generatePasswordHash().catch(console.error); 