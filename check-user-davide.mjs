#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Carica le variabili d'ambiente
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkUserDavide() {
  try {
    console.log('🔍 Controllo utente davide431@outlook.it...\n');

    // Cerca l'utente nel database
    const users = await sql`
      SELECT 
        id,
        name,
        email,
        image,
        "emailVerified",
        "createdAt",
        "updatedAt",
        phone
      FROM users 
      WHERE email = 'davide431@outlook.it'
    `;

    if (users.length === 0) {
      console.log('❌ Utente NON TROVATO nel database');
      console.log('💡 L\'utente deve prima registrarsi/accedere al sito');
      return;
    }

    const user = users[0];
    console.log('✅ Utente TROVATO nel database:');
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   👤 Nome: ${user.name || 'Non impostato'}`);
    console.log(`   📱 Telefono: ${user.phone || 'Non impostato'}`);
    console.log(`   ✉️  Email verificata: ${user.emailVerified ? '✅ Sì' : '❌ No'}`);
    console.log(`   � Creato il: ${new Date(user.createdAt).toLocaleString('it-IT')}`);
    console.log(`   🆔 ID: ${user.id}\n`);

    // Controlla le variabili d'ambiente
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    const barberEmails = process.env.BARBER_EMAILS?.split(',').map(email => email.trim()) || [];
    
    console.log('🔐 Controllo permessi:');
    console.log(`   📋 Admin emails configurati: ${adminEmails.join(', ')}`);
    console.log(`   ✂️  Barber emails configurati: ${barberEmails.join(', ')}`);
    
    const isAdmin = adminEmails.includes(user.email);
    const isBarber = barberEmails.includes(user.email);
    
    console.log(`   � È Admin: ${isAdmin ? '✅ SÌ' : '❌ NO'}`);
    console.log(`   ✂️  È Barber: ${isBarber ? '✅ SÌ' : '❌ NO'}`);
    
    if (!isAdmin && !isBarber) {
      console.log('\n⚠️  PROBLEMA: L\'utente non ha permessi speciali');
      console.log('� Verifica che l\'email sia nelle variabili ADMIN_EMAILS o BARBER_EMAILS');
    } else {
      console.log('\n🎉 Utente configurato correttamente!');
    }

    // Controlla anche la tabella authorized_roles (se esiste)
    try {
      const authorizedRoles = await sql`
        SELECT role, email, "createdAt"
        FROM authorized_roles 
        WHERE email = 'davide431@outlook.it'
      `;
      
      if (authorizedRoles.length > 0) {
        console.log('\n📊 Ruoli nella tabella authorized_roles:');
        authorizedRoles.forEach(role => {
          console.log(`   🎭 Ruolo: ${role.role} (aggiunto il ${new Date(role.createdAt).toLocaleString('it-IT')})`);
        });
      }
    } catch (error) {
      console.log('\n💡 Tabella authorized_roles non ancora utilizzata (OK)');
    }

  } catch (error) {
    console.error('❌ Errore durante il controllo:', error.message);
  }
}

checkUserDavide();
