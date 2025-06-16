// Script Node.js per gestire il database
const { execSync } = require('child_process');

const command = process.argv[2];

if (!command) {
  console.log('📖 MASKIO BARBER - Database Management');
  console.log('');
  console.log('🔧 Comandi disponibili:');
  console.log('  npm run db:status     - Mostra stato database');
  console.log('  npm run db:clean      - Pulisci database');
  console.log('  npm run db:promote    - Promuovi utente');
  console.log('');
  process.exit(0);
}

try {
  switch(command) {
    case 'status':
      // Esegui lo script attraverso l'API
      execSync('curl -X GET http://localhost:3000/api/debug/database-status', { stdio: 'inherit' });
      break;
    
    default:
      console.log('❌ Comando non riconosciuto');
  }
} catch (error) {
  console.error('❌ Errore:', error.message);
}
