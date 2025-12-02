#!/usr/bin/env node

/**
 * Script per pulire file di test e debug dalla root del progetto
 * 
 * MANTIENE:
 * - init-admin.mjs
 * - generate-password-hash.mjs
 * - set-barber-role.mjs
 * - promote-user-role.mjs
 * - reset-user-password.mjs
 * - postcss.config.mjs
 * - migrate-to-postgres.mjs
 * - database-script-template.mjs
 * 
 * ELIMINA: Tutti gli altri .mjs nella root
 */

import { readdir, unlink } from 'fs/promises';
import { join } from 'path';

const KEEP_FILES = new Set([
  'postcss.config.mjs',
  'init-admin.mjs',
  'generate-password-hash.mjs',
  'set-barber-role.mjs',
  'promote-user-role.mjs',
  'reset-user-password.mjs',
  'migrate-to-postgres.mjs',
  'database-script-template.mjs',
  'cleanup-test-files.mjs', // Questo script stesso
]);

async function cleanup() {
  console.log('\n🧹 PULIZIA FILE DI TEST E DEBUG\n');
  console.log('═'.repeat(60));
  
  try {
    const files = await readdir('.');
    const mjsFiles = files.filter(f => f.endsWith('.mjs'));
    
    console.log(`\n📋 Trovati ${mjsFiles.length} file .mjs nella root\n`);
    
    const toDelete = mjsFiles.filter(f => !KEEP_FILES.has(f));
    const toKeep = mjsFiles.filter(f => KEEP_FILES.has(f));
    
    console.log(`✅ File da mantenere (${toKeep.length}):\n`);
    toKeep.forEach(f => console.log(`   ✓ ${f}`));
    
    console.log(`\n🗑️  File da eliminare (${toDelete.length}):\n`);
    
    if (toDelete.length === 0) {
      console.log('   (nessuno)\n');
      return;
    }
    
    let deleted = 0;
    let errors = 0;
    
    for (const file of toDelete) {
      try {
        await unlink(file);
        console.log(`   ✓ ${file}`);
        deleted++;
      } catch (error) {
        console.log(`   ✗ ${file} - Errore: ${error.message}`);
        errors++;
      }
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log(`\n📊 RISULTATO:`);
    console.log(`   ✅ Eliminati: ${deleted}`);
    console.log(`   ❌ Errori: ${errors}`);
    console.log(`   ✓ Mantenuti: ${toKeep.length}\n`);
    
    if (deleted > 0) {
      console.log('✅ Pulizia completata con successo!\n');
    }
    
  } catch (error) {
    console.error('❌ Errore durante la pulizia:', error);
    process.exit(1);
  }
}

cleanup();
