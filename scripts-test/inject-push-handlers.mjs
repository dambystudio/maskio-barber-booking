// Post-build script per iniettare push handlers in sw.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swPath = path.join(__dirname, 'public', 'sw.js');
const pushHandlersPath = path.join(__dirname, 'public', 'sw-push-handlers.js');

console.log('🔧 Iniettando push handlers in sw.js...');

try {
  // Leggi sw.js
  let swContent = fs.readFileSync(swPath, 'utf8');
  
  // Leggi push handlers
  const pushHandlersContent = fs.readFileSync(pushHandlersPath, 'utf8');
  
  // Cerca la riga con importScripts() vuoto
  const importScriptsPattern = /importScripts\(\);/g;
  
  if (importScriptsPattern.test(swContent)) {
    // Sostituisci importScripts() con import del file push handlers
    swContent = swContent.replace(
      importScriptsPattern,
      "importScripts('/sw-push-handlers.js');"
    );
    
    // Scrivi il file modificato
    fs.writeFileSync(swPath, swContent, 'utf8');
    
    console.log('✅ Push handlers iniettati con successo in sw.js');
    console.log('   → importScripts() ora carica /sw-push-handlers.js');
  } else {
    console.log('⚠️  importScripts() non trovato in sw.js');
    console.log('   Aggiungo push handlers alla fine del file...');
    
    // Aggiungi alla fine
    swContent += '\n\n' + '// Push notification handlers\n' + pushHandlersContent;
    fs.writeFileSync(swPath, swContent, 'utf8');
    
    console.log('✅ Push handlers aggiunti alla fine di sw.js');
  }
  
} catch (error) {
  console.error('❌ Errore:', error);
  process.exit(1);
}
