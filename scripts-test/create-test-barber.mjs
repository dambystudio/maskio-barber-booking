#!/usr/bin/env node

/**
 * Crea un utente barbiere di test per verificare il flusso di prenotazione manuale
 */

import fs from 'fs';
import { randomUUID } from 'crypto';

console.log('🧑‍💼 CREATING TEST BARBER USER');
console.log('='.repeat(40));

// Dati del barbiere di test
const testBarber = {
  id: randomUUID(),
  name: "Test Barbiere",
  email: "barbiere.test@maskio.com",
  role: "barber",
  password: "$2a$10$mockhashedpassword", // Password hash mock
  phone: "+393331234567",
  created_at: new Date().toISOString(),
  email_verified: true,
  phone_verified: true
};

console.log('👤 Test Barber Data:');
console.log(JSON.stringify(testBarber, null, 2));
console.log();

// Nota per il test manuale
console.log('📝 MANUAL TEST INSTRUCTIONS:');
console.log('='.repeat(40));
console.log('1. Per testare il flusho barbiere, accedi con:');
console.log(`   Email: ${testBarber.email}`);
console.log('   Password: password (o crea l\'account manualmente)');
console.log();
console.log('2. Una volta loggato come barbiere:');
console.log('   • Vai alla pagina di prenotazione');
console.log('   • Verifica che i campi cliente siano editabili');
console.log('   • Inserisci dati cliente di test:');
console.log('     - Nome: Mario Rossi');
console.log('     - Email: mario.test@example.com'); 
console.log('     - Telefono: +393451234567');
console.log('   • Procedi con la prenotazione');
console.log('   • Verifica SMS di conferma');
console.log('   • Controlla che la prenotazione appaia nel pannello');
console.log();
console.log('3. Controlla le email inviate:');
console.log('   • Email di conferma al cliente');
console.log('   • Notifica admin');
console.log();

// Suggerimento per l'autenticazione
console.log('🔐 AUTHENTICATION SETUP:');
console.log('='.repeat(40));
console.log('Il sistema usa NextAuth. Per testare come barbiere:');
console.log('• Registrati normalmente dal sito');
console.log('• Modifica manualmente il ruolo nel database');
console.log('• Oppure modifica temporaneamente il codice per assegnare ruolo "barber"');
console.log();

console.log('✅ Ready for manual testing!');
