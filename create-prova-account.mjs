import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL);

async function createProvaAccount() {
  console.log('👤 CREAZIONE ACCOUNT DI PROVA');
  console.log('==============================\n');

  try {
    const testEmail = 'prova@gmail.com';
    
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
    console.log('\n👤 3. Creando nuovo account di prova...');
    
    const userData = {
      name: 'Utente Prova',
      email: testEmail,
      phone: '+39 333 555 0000',
      password: 'prova123',
      role: 'customer' // Inizia come customer, dovrebbe essere aggiornato automaticamente se configurato
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
    
    const shouldBeBarber = barberEmails.includes(createdUser.email);
    const shouldBeAdmin = adminEmails.includes(createdUser.email);
    
    let expectedRole = 'customer';
    if (shouldBeAdmin) {
      expectedRole = 'admin';
    } else if (shouldBeBarber) {
      expectedRole = 'barber';
    }

    console.log(`🎯 Ruolo atteso basato su variabili d'ambiente: ${expectedRole}`);

    // 5. Aggiorna il ruolo se necessario
    if (createdUser.role !== expectedRole) {
      console.log(`\n🔄 5. Aggiornando ruolo da "${createdUser.role}" a "${expectedRole}"...`);
      
      await sql`
        UPDATE users 
        SET role = ${expectedRole}
        WHERE id = ${createdUser.id}
      `;
      console.log(`✅ Ruolo aggiornato con successo`);
    } else {
      console.log(`\n✅ 5. Ruolo "${expectedRole}" già corretto`);
    }

    // 6. Verifica finale
    console.log('\n🔍 6. Verifica finale...');
    const finalUser = await sql`
      SELECT id, name, email, role, phone, created_at 
      FROM users 
      WHERE email = ${testEmail}
    `;

    if (finalUser.length > 0) {
      const user = finalUser[0];
      console.log(`\n🎉 ACCOUNT DI PROVA CREATO E CONFIGURATO:`);
      console.log(`   👤 Nome: ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   📱 Telefono: ${user.phone}`);
      console.log(`   🏷️ Ruolo: ${user.role}`);
      console.log(`   📅 Creato: ${user.created_at}`);

      // 7. Credenziali di login
      console.log(`\n🔑 CREDENZIALI PER IL LOGIN:`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      
      console.log(`\n📋 PROSSIMI PASSI:`);
      console.log(`   1. Vai su /auth/signin`);
      console.log(`   2. Accedi con le credenziali sopra`);
      if (user.role === 'barber') {
        console.log(`   3. Verifica che appaia il pannello barbiere`);
        console.log(`   4. Controlla che possa accedere a /pannello-prenotazioni`);
      } else if (user.role === 'admin') {
        console.log(`   3. Verifica che appaia il pannello admin`);
        console.log(`   4. Controlla che possa accedere a /admin/users`);
      } else {
        console.log(`   3. Account cliente creato - può fare prenotazioni`);
        console.log(`   4. Per rendere barbiere/admin, aggiungi l'email alle variabili d'ambiente`);
      }

      if (user.role === 'barber' || user.role === 'admin') {
        console.log(`\n✅ SUCCESSO: Il sistema ha assegnato automaticamente il ruolo ${user.role}!`);
      } else {
        console.log(`\n💡 NOTA: Il ruolo è "${user.role}" - normale per un account di test`);
        console.log(`   Per renderlo barbiere: aggiungi ${testEmail} a BARBER_EMAILS`);
        console.log(`   Per renderlo admin: aggiungi ${testEmail} a ADMIN_EMAILS`);
      }

    } else {
      console.log(`❌ ERRORE: Account non trovato dopo la creazione`);
    }

  } catch (error) {
    console.error('\n❌ ERRORE DURANTE LA CREAZIONE:', error);
    console.log('\n🔧 Verifica:');
    console.log('1. Database connesso correttamente');
    console.log('2. Variabili d\'ambiente configurate in .env.local');
    console.log('3. Tabella users esistente');
  }
}

// Esegui la funzione
createProvaAccount().catch(console.error); 