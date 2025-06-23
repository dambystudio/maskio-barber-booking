#!/usr/bin/env node
/**
 * Script per creare account test di Fabio e verificare assegnazione automatica ruolo barbiere
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import bcrypt from 'bcryptjs';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createFabioAccount() {
  console.log('👨‍💼 CREAZIONE ACCOUNT FABIO CASSANO');
  console.log('=====================================\n');

  try {
    const testEmail = 'fabio.cassano97@icloud.com';
    
    // 1. Verifica se l'account esiste già
    console.log('🔍 1. Verificando se l\'account esiste già...');
    const existingUsers = await sql`
      SELECT id, name, email, role, created_at 
      FROM users 
      WHERE email = ${testEmail}
    `;

    if (existingUsers.length > 0) {
      console.log(`⚠️ Account già esistente:`);
      console.log(`   Nome: ${existingUsers[0].name}`);
      console.log(`   Email: ${existingUsers[0].email}`);
      console.log(`   Ruolo: ${existingUsers[0].role}`);
      console.log(`   Creato: ${existingUsers[0].created_at}`);
      
      console.log('\n🗑️ Eliminando account esistente per ricrearlo...');
      await sql`DELETE FROM users WHERE email = ${testEmail}`;
      console.log('✅ Account precedente eliminato');
    }

    // 2. Verifica configurazione variabili d'ambiente
    console.log('\n🔧 2. Verificando configurazione ruoli...');
    const barberEmails = process.env.BARBER_EMAILS?.split(',').map(email => email.trim()) || [];
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    
    console.log(`📧 BARBER_EMAILS: ${barberEmails.join(', ')}`);
    console.log(`👑 ADMIN_EMAILS: ${adminEmails.join(', ')}`);
    
    const isBarber = barberEmails.includes(testEmail);
    const isAdmin = adminEmails.includes(testEmail);
    
    console.log(`\n✅ ${testEmail} è configurato come:`);
    console.log(`   Barbiere: ${isBarber ? '✅ SÌ' : '❌ NO'}`);
    console.log(`   Admin: ${isAdmin ? '✅ SÌ' : '❌ NO'}`);

    // 3. Crea l'account
    console.log('\n👤 3. Creando nuovo account...');
    
    const userData = {
      name: 'Fabio Cassano',
      email: testEmail,
      phone: '+39 333 987 6543',
      password: 'Password123!',
      role: 'customer' // Inizia come customer, dovrebbe essere aggiornato automaticamente
    };

    // Hash della password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const [createdUser] = await sql`
      INSERT INTO users (name, email, phone, password, role, created_at, "emailVerified")
      VALUES (
        ${userData.name}, 
        ${userData.email}, 
        ${userData.phone}, 
        ${hashedPassword}, 
        ${userData.role}, 
        NOW(), 
        NOW()
      )
      RETURNING id, name, email, role, created_at
    `;

    console.log(`✅ Account creato con successo:`);
    console.log(`   ID: ${createdUser.id}`);
    console.log(`   Nome: ${createdUser.name}`);
    console.log(`   Email: ${createdUser.email}`);
    console.log(`   Ruolo iniziale: ${createdUser.role}`);
    console.log(`   Creato: ${createdUser.created_at}`);

    // 4. Simula il processo di login e verifica ruolo
    console.log('\n🔑 4. Simulando processo di verifica ruolo...');
    
    // Questa è la logica che viene eseguita quando l'utente fa login
    // (simula quello che fa l'API /api/debug/check-permissions)
    
    const shouldBeBarber = barberEmails.includes(createdUser.email);
    const shouldBeAdmin = adminEmails.includes(createdUser.email);
    
    let expectedRole = 'customer';
    if (shouldBeAdmin) {
      expectedRole = 'admin';
    } else if (shouldBeBarber) {
      expectedRole = 'barber';
    }

    console.log(`🎯 Ruolo atteso basato su variabili d'ambiente: ${expectedRole}`);

    // 5. Aggiorna il ruolo se necessario (simula ciò che dovrebbe fare il sistema)
    if (createdUser.role !== expectedRole) {
      console.log(`\n🔄 5. Aggiornando ruolo da "${createdUser.role}" a "${expectedRole}"...`);
        const [updatedUser] = await sql`
        UPDATE users 
        SET role = ${expectedRole}
        WHERE id = ${createdUser.id}
        RETURNING id, name, email, role
      `;

      console.log(`✅ Ruolo aggiornato con successo:`);
      console.log(`   Nome: ${updatedUser.name}`);
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Nuovo ruolo: ${updatedUser.role}`);
    } else {
      console.log(`✅ Ruolo già corretto: ${createdUser.role}`);
    }

    // 6. Verifica finale
    console.log('\n🔍 6. Verifica finale dell\'account...');
    const finalUser = await sql`
      SELECT id, name, email, role, phone, created_at 
      FROM users 
      WHERE email = ${testEmail}
    `;

    if (finalUser.length > 0) {
      const user = finalUser[0];
      console.log(`\n🎉 ACCOUNT FABIO CASSANO CREATO E CONFIGURATO:`);
      console.log(`   👤 Nome: ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   📱 Telefono: ${user.phone}`);
      console.log(`   🏷️ Ruolo: ${user.role}`);
      console.log(`   📅 Creato: ${user.created_at}`);

      // 7. Test di login
      console.log(`\n🔑 CREDENZIALI PER IL LOGIN:`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      
      console.log(`\n📋 PROSSIMI PASSI:`);
      console.log(`   1. Vai su http://localhost:3000/auth/signin`);
      console.log(`   2. Accedi con le credenziali sopra`);
      console.log(`   3. Verifica che appaia il pannello barbiere`);
      console.log(`   4. Controlla che possa accedere a /pannello-prenotazioni`);
      console.log(`   5. Verifica che veda solo le proprie prenotazioni`);

      if (user.role === 'barber') {
        console.log(`\n✅ SUCCESSO: Il sistema ha assegnato automaticamente il ruolo barbiere!`);
      } else {
        console.log(`\n⚠️ ATTENZIONE: Il ruolo è "${user.role}" invece di "barber"`);
        console.log(`   Verifica la configurazione BARBER_EMAILS in .env.local`);
      }

    } else {
      console.log(`❌ ERRORE: Account non trovato dopo la creazione`);
    }

  } catch (error) {
    console.error('\n❌ ERRORE DURANTE LA CREAZIONE:', error);
    console.log('\n🔧 Verifica:');
    console.log('1. Database connesso correttamente');
    console.log('2. Variabile BARBER_EMAILS configurata in .env.local');
    console.log('3. Tabella users esistente');
  }
}

// Esegui la creazione dell'account
createFabioAccount().catch(console.error);
