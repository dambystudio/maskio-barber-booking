import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const SEARCH_EMAIL = 'michelebiancofiore0230@gmail.com';
const SEARCH_DIRECTORIES = [
  'src',
  '.' // root directory per script .mjs
];

const EXCLUDED_PATTERNS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  '.backup'
];

function searchEmailInFiles() {
  console.log(`🔍 Ricerca di "${SEARCH_EMAIL}" nel codebase...\n`);
  
  let totalFound = 0;
  const foundFiles = [];

  function searchInDirectory(dir, depth = 0) {
    try {
      const files = readdirSync(dir);
      
      for (const file of files) {
        const fullPath = join(dir, file);
        const relativePath = fullPath.replace(process.cwd(), '').replace(/\\/g, '/');
        
        // Skip excluded directories
        if (EXCLUDED_PATTERNS.some(pattern => relativePath.includes(pattern))) {
          continue;
        }

        try {
          const stat = statSync(fullPath);
          
          if (stat.isDirectory() && depth < 10) {
            searchInDirectory(fullPath, depth + 1);
          } else if (stat.isFile()) {
            // Search only in relevant file types
            const ext = file.split('.').pop()?.toLowerCase();
            if (['tsx', 'ts', 'js', 'jsx', 'mjs', 'json', 'env', 'local', 'md'].includes(ext) || file === '.env.local') {
              searchInFile(fullPath, relativePath);
            }
          }
        } catch (error) {
          // Skip files that can't be accessed
        }
      }
    } catch (error) {
      console.log(`⚠️  Impossibile leggere directory: ${dir}`);
    }
  }

  function searchInFile(filePath, relativePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.includes(SEARCH_EMAIL)) {
          if (!foundFiles.includes(relativePath)) {
            foundFiles.push(relativePath);
          }
          
          console.log(`📍 ${relativePath}:${index + 1}`);
          console.log(`   ${line.trim()}`);
          console.log('');
          totalFound++;
        }
      });
    } catch (error) {
      // Skip files that can't be read
    }
  }

  // Start search
  for (const dir of SEARCH_DIRECTORIES) {
    if (dir === '.') {
      // Search root directory files only
      try {
        const files = readdirSync('.');
        for (const file of files) {
          if (file.endsWith('.mjs') || file.endsWith('.js') || file === '.env.local') {
            const stat = statSync(file);
            if (stat.isFile()) {
              searchInFile(file, `./${file}`);
            }
          }
        }
      } catch (error) {
        console.log(`⚠️  Errore lettura directory root:`, error.message);
      }
    } else {
      searchInDirectory(dir);
    }
  }

  // Summary
  console.log('📊 RIEPILOGO RICERCA:');
  console.log(`   🔢 Occorrenze totali: ${totalFound}`);
  console.log(`   📁 File coinvolti: ${foundFiles.length}`);
  
  if (foundFiles.length > 0) {
    console.log('\n📋 File da modificare:');
    foundFiles.forEach(file => {
      console.log(`   - ${file}`);
    });

    console.log('\n🛠️  AZIONI RICHIESTE:');
    console.log('1. Aggiornare .env.local (BARBER_EMAILS)');
    console.log('2. Aggiornare tutti i file TypeScript/JavaScript listati sopra');
    console.log('3. Aggiornare database (barber_recurring_closures)');
    console.log('4. Testare autenticazione e permessi di Michele');
    console.log('\n💡 Suggerimento: Usare il comando "Sostituisci in tutti i file" di VS Code');
    console.log(`   Cerca: ${SEARCH_EMAIL}`);
    console.log(`   Sostituisci con: NUOVA_EMAIL_MICHELE`);
  } else {
    console.log('\n✅ Nessuna occorrenza trovata (email già aggiornata?)');
  }
}

searchEmailInFiles();
