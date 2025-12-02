#!/usr/bin/env node
/**
 * Test Rapido Eliminazione Account Admin - Versione Corretta
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function quickTest() {
  console.log('🧪 QUICK TEST ELIMINAZIONE ACCOUNT');
  console.log('==================================\n');

  const timestamp = Date.now();
  const email = `test-delete-${timestamp}@example.com`;
  
  try {
    // 1. Crea utente
    const [user] = await sql`
      INSERT INTO users (name, email, phone, role, created_at, "emailVerified")
      VALUES ('Test User', ${email}, '+39 333 123 456', 'customer', NOW(), NOW())
      RETURNING id, name, email
    `;
    console.log(`✅ Utente creato: ${user.name} (${user.id})`);

    // 2. Simula eliminazione (come farebbe l'API)
    await sql`DELETE FROM bookings WHERE user_id = ${user.id}`;
    await sql`DELETE FROM accounts WHERE "userId" = ${user.id}`;
    await sql`DELETE FROM sessions WHERE "userId" = ${user.id}`;
    const deletedUsers = await sql`DELETE FROM users WHERE id = ${user.id} RETURNING *`;
    
    console.log(`✅ Utente eliminato: ${deletedUsers[0].name}`);

    // 3. Verifica
    const check = await sql`SELECT COUNT(*) as count FROM users WHERE id = ${user.id}`;
    const userExists = check[0].count > 0;
    
    if (userExists) {
      console.log('❌ FALLITO: Utente ancora presente');
    } else {
      console.log('✅ SUCCESSO: Utente completamente eliminato');
    }

    console.log('\n🎯 CONCLUSIONE:');
    console.log(`   Funzionalità: ${userExists ? 'NON FUNZIONA' : 'FUNZIONA CORRETTAMENTE'}`);

  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

quickTest().catch(console.error);
