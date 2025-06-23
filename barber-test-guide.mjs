#!/usr/bin/env node

/**
 * Guida per testare il flusso barbiere
 * Spiega come configurare un utente barbiere per i test
 */

console.log('🧑‍💼 GUIDA TEST BARBIERE - CONFIGURAZIONE');
console.log('='.repeat(50));

console.log('📧 OPZIONE 1: Usa email barbiere esistente');
console.log('-'.repeat(30));
console.log('Il sistema riconosce automaticamente come barbieri:');
console.log('• fabio.cassano97@icloud.com');
console.log('• michelebiancofiore0230@gmail.com');
console.log();
console.log('Puoi registrarti/accedere con una di queste email.');
console.log();

console.log('📧 OPZIONE 2: Aggiungi la tua email come barbiere');
console.log('-'.repeat(30));
console.log('1. Apri il file .env.local');
console.log('2. Modifica la riga BARBER_EMAILS aggiungendo la tua email:');
console.log('   BARBER_EMAILS=fabio.cassano97@icloud.com,michelebiancofiore0230@gmail.com,tuaemail@esempio.com');
console.log('3. Riavvia il server (npm run dev)');
console.log('4. Registrati con la tua email');
console.log();

console.log('🔧 OPZIONE 3: Test temporaneo (per sviluppatori)');
console.log('-'.repeat(30));
console.log('Modifica temporaneamente il codice per forzare il ruolo barbiere:');
console.log('Nel file src/components/BookingForm.tsx, riga ~25:');
console.log('  const isBarber = true; // Forza sempre true per test');
console.log('Ricorda di ripristinare dopo il test!');
console.log();

console.log('🎯 STEPS PER IL TEST:');
console.log('-'.repeat(30));
console.log('1. Configura email barbiere (opzione 1 o 2)');
console.log('2. Registrati/accedi con email barbiere');
console.log('3. Vai a: http://localhost:3000');
console.log('4. Clicca "Prenota Ora"');
console.log('5. Verifica che i campi cliente siano editabili');
console.log('6. Inserisci dati cliente di test:');
console.log('   • Nome: Mario Rossi');
console.log('   • Email: mario.test@example.com');
console.log('   • Telefono: +393451234567');
console.log('7. Completa la prenotazione e verifica SMS');
console.log();

console.log('✨ Una volta configurato, vedrai:');
console.log('• Campi nome, email, telefono editabili');
console.log('• Testo "Modalità Barbiere: Stai prenotando per un cliente"');
console.log('• Possibilità di inserire dati cliente manualmente');
console.log();

console.log('🚀 Pronto per il test!');
