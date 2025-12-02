import { readFileSync } from 'fs';

function testClosedMessage() {
  console.log('🧪 Test modifica messaggio "Chiuso"...\n');

  try {
    // Verifica che il file BookingForm.tsx non contenga più "Barbiere chiuso"
    const bookingFormContent = readFileSync('src/components/BookingForm.tsx', 'utf8');
    
    const oldMessageCount = (bookingFormContent.match(/Barbiere chiuso/g) || []).length;
    const newMessageCount = (bookingFormContent.match(/Chiuso/g) || []).length;
    
    console.log('📋 Verifica BookingForm.tsx:');
    console.log(`   ❌ "Barbiere chiuso": ${oldMessageCount} occorrenze`);
    console.log(`   ✅ "Chiuso": ${newMessageCount} occorrenze`);
    
    if (oldMessageCount === 0 && newMessageCount >= 2) {
      console.log('✅ Modifica applicata correttamente!');
    } else {
      console.log('⚠️  Potrebbero esserci ancora occorrenze da modificare');
    }

    // Verifica anche il file di test
    const testFileContent = readFileSync('test-frontend-changes.js', 'utf8');
    const testOldCount = (testFileContent.match(/Barbiere chiuso/g) || []).length;
    const testNewCount = (testFileContent.match(/Chiuso/g) || []).length;
    
    console.log('\n📋 Verifica test-frontend-changes.js:');
    console.log(`   ❌ "Barbiere chiuso": ${testOldCount} occorrenze`);
    console.log(`   ✅ "Chiuso": ${testNewCount} occorrenze`);

    console.log('\n🎯 RISULTATO:');
    if (oldMessageCount === 0 && testOldCount === 0) {
      console.log('✅ Tutte le occorrenze di "Barbiere chiuso" sono state sostituite con "Chiuso"');
      console.log('📱 Ora nei giorni chiusi apparirà semplicemente "Chiuso" al posto di "Barbiere chiuso"');
    } else {
      console.log('⚠️  Alcune occorrenze potrebbero essere rimaste, verifica manualmente');
    }

  } catch (error) {
    console.error('❌ Errore durante il test:', error.message);
  }
}

testClosedMessage();
