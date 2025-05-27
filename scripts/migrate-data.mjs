/**
 * Script di migrazione dati JSON → Vercel KV Database
 * 
 * Questo script migra le prenotazioni dal vecchio sistema JSON
 * al nuovo database Vercel KV enterprise.
 * 
 * IMPORTANTE: Eseguire solo una volta dopo aver configurato Vercel KV!
 * 
 * Come usarlo:
 * 1. Configura le variabili d'ambiente Vercel KV in .env.local
 * 2. Esegui: node scripts/migrate-data.mjs
 */

import { kv } from '@vercel/kv';
import fs from 'fs/promises';
import path from 'path';

// Mappa i barbieri (ID → Nome)
const BARBER_NAMES = {
  '1': 'Michele',
  '2': 'Fabio'
};

async function migrateBookings() {
  try {
    console.log('🚀 Inizio migrazione dati JSON → Vercel KV Database...\n');

    // Leggi i dati JSON esistenti
    const jsonPath = path.join(process.cwd(), 'data', 'bookings.json');
    const jsonData = await fs.readFile(jsonPath, 'utf-8');
    const oldBookings = JSON.parse(jsonData);

    console.log(`📁 Trovate ${oldBookings.length} prenotazioni nel file JSON`);

    // Contatori per il report
    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const oldBooking of oldBookings) {
      try {
        // Verifica se la prenotazione esiste già
        const existingBooking = await kv.get(`booking:${oldBooking.id}`);
        if (existingBooking) {
          console.log(`⏭️  Prenotazione ${oldBooking.id} già esistente, salto...`);
          skipped++;
          continue;
        }

        // Converti il formato JSON al formato del database
        const newBooking = {
          id: oldBooking.id,
          userId: `guest_${Date.now()}_${oldBooking.id}`, // ID guest per prenotazioni esistenti
          customerName: oldBooking.customerInfo.name,
          customerEmail: oldBooking.customerInfo.email,
          customerPhone: oldBooking.customerInfo.phone,
          barberId: oldBooking.barberId,
          barberName: BARBER_NAMES[oldBooking.barberId] || 'Barbiere Sconosciuto',
          service: oldBooking.services.map(s => s.name).join(', '),
          price: oldBooking.totalPrice,
          date: oldBooking.date,
          time: oldBooking.time,
          duration: oldBooking.totalDuration,
          status: 'confirmed', // Tutte le prenotazioni esistenti sono confermate
          notes: oldBooking.customerInfo.notes || '',
          createdAt: oldBooking.createdAt,
          updatedAt: oldBooking.createdAt
        };

        // Salva nel database KV
        await kv.set(`booking:${newBooking.id}`, newBooking);

        // Aggiungi agli indici
        await kv.sadd('bookings:all', newBooking.id);
        await kv.sadd(`bookings:user:${newBooking.userId}`, newBooking.id);
        await kv.sadd(`bookings:barber:${newBooking.barberId}`, newBooking.id);
        await kv.sadd(`bookings:date:${newBooking.date}`, newBooking.id);

        console.log(`✅ Migrata prenotazione ${newBooking.id} - ${newBooking.customerName} (${newBooking.date} ${newBooking.time})`);
        migrated++;

      } catch (error) {
        console.error(`❌ Errore nella migrazione della prenotazione ${oldBooking.id}:`, error);
        errors++;
      }
    }

    // Report finale
    console.log('\n📊 REPORT MIGRAZIONE:');
    console.log(`✅ Migrate con successo: ${migrated}`);
    console.log(`⏭️  Saltate (già esistenti): ${skipped}`);
    console.log(`❌ Errori: ${errors}`);
    console.log(`📊 Totale elaborate: ${migrated + skipped + errors}`);

    if (migrated > 0) {
      console.log('\n🎉 Migrazione completata con successo!');
      console.log('💡 Il vecchio file JSON è ancora presente per sicurezza.');
      console.log('💡 Puoi rimuoverlo manualmente una volta verificato che tutto funzioni.');
    }

    // Verifica finale
    const allBookings = await kv.smembers('bookings:all');
    console.log(`\n🔍 Verifica: ${allBookings.length} prenotazioni totali nel database KV`);

  } catch (error) {
    console.error('💥 Errore critico durante la migrazione:', error);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Verifica che le variabili d\'ambiente Vercel KV siano configurate in .env.local');
    console.log('2. Verifica di avere accesso al database Vercel KV');
    console.log('3. Verifica che il file data/bookings.json esista');
    process.exit(1);
  }
}

// Funzione per creare utenti admin di default
async function createDefaultUsers() {
  try {
    console.log('\n👤 Creazione utenti di default...');

    // Admin user
    const adminUser = {
      id: 'admin_001',
      email: process.env.ADMIN_EMAIL || 'admin@maskio.com',
      name: 'Admin Maskio',
      role: 'admin',
      phone: '+39 123 456 7890',
      createdAt: new Date().toISOString(),
    };

    // Verifica se l'admin esiste già
    const existingAdmin = await kv.get(`user:${adminUser.id}`);
    if (!existingAdmin) {
      await kv.set(`user:${adminUser.id}`, adminUser);
      await kv.set(`user:email:${adminUser.email}`, adminUser.id);
      console.log(`✅ Creato utente admin: ${adminUser.email}`);
    } else {
      console.log(`⏭️  Utente admin già esistente: ${adminUser.email}`);
    }

    // Barber users
    const barbers = [
      {
        id: 'barber_michele',
        email: 'michele@maskio.com',
        name: 'Michele',
        role: 'barber',
        phone: '+39 123 456 7891',
      },
      {
        id: 'barber_fabio',
        email: 'fabio@maskio.com',
        name: 'Fabio',
        role: 'barber',
        phone: '+39 123 456 7892',
      }
    ];

    for (const barber of barbers) {
      const existingBarber = await kv.get(`user:${barber.id}`);
      if (!existingBarber) {
        const barberUser = {
          ...barber,
          createdAt: new Date().toISOString(),
        };
        await kv.set(`user:${barberUser.id}`, barberUser);
        await kv.set(`user:email:${barberUser.email}`, barberUser.id);
        console.log(`✅ Creato utente barbiere: ${barberUser.name}`);
      } else {
        console.log(`⏭️  Barbiere già esistente: ${barber.name}`);
      }
    }

  } catch (error) {
    console.error('❌ Errore nella creazione degli utenti di default:', error);
  }
}

// Funzione principale
async function main() {
  console.log('🎯 MASKIO BARBER - MIGRAZIONE ENTERPRISE');
  console.log('=======================================\n');

  await createDefaultUsers();
  await migrateBookings();

  console.log('\n🏁 Migrazione terminata!');
  process.exit(0);
}

// Esegui se chiamato direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { migrateBookings, createDefaultUsers };
