#!/usr/bin/env node
/**
 * Script per aprire Nicolò la mattina in date specifiche
 * 
 * Uso: node open-nicolo-morning.mjs 2024-12-25
 * 
 * Questo script:
 * 1. Aggiunge slot mattutini (09:00-12:30) allo schedule esistente
 * 2. Il sistema rileverà automaticamente che è eccezionale
 * 3. Il daily-update NON creerà chiusure automatiche
 */

import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

// Slot mattutini standard (09:00-12:30)
const MORNING_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', 
  '11:00', '11:30', '12:00', '12:30'
];

// Slot pomeridiani standard per Nicolò (15:00-17:30)
const AFTERNOON_SLOTS = [
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

async function openNicoloMorning(dateString) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    // Verifica che la data sia valida
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Data non valida. Usa formato YYYY-MM-DD (es: 2024-12-25)');
    }

    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) {
      throw new Error('Domenica: il negozio è sempre chiuso');
    }

    console.log(`📅 Apertura mattutina per Nicolò: ${dateString}\n`);

    // Controlla se esiste già uno schedule
    const existing = await client.query(
      `SELECT id, available_slots, day_off FROM barber_schedules 
       WHERE barber_id = 'nicolo' AND date = $1`,
      [dateString]
    );

    let slots;
    let action;

    if (existing.rows.length === 0) {
      // Crea nuovo schedule con mattina + pomeriggio
      slots = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];
      action = 'created';

      await client.query(
        `INSERT INTO barber_schedules 
         (barber_id, date, available_slots, unavailable_slots, day_off, created_at, updated_at)
         VALUES ('nicolo', $1, $2, '[]', false, NOW(), NOW())`,
        [dateString, JSON.stringify(slots)]
      );

      console.log('✅ Nuovo schedule creato');
    } else {
      // Modifica schedule esistente aggiungendo slot mattutini
      const currentSlots = existing.rows[0].available_slots || [];
      const isDayOff = existing.rows[0].day_off;

      if (isDayOff) {
        // Se era day_off, usa solo slot mattutini
        slots = MORNING_SLOTS;
      } else {
        // Aggiungi slot mattutini a quelli esistenti (rimuovi duplicati)
        const allSlots = [...MORNING_SLOTS, ...currentSlots];
        slots = [...new Set(allSlots)].sort();
      }

      action = 'updated';

      await client.query(
        `UPDATE barber_schedules 
         SET available_slots = $1, day_off = false, updated_at = NOW()
         WHERE barber_id = 'nicolo' AND date = $2`,
        [JSON.stringify(slots), dateString]
      );

      console.log('✅ Schedule esistente aggiornato');
    }

    // Mostra gli slot configurati
    console.log('\n📋 Slot disponibili:');
    const morningCount = slots.filter(s => parseInt(s.split(':')[0]) < 14).length;
    const afternoonCount = slots.filter(s => parseInt(s.split(':')[0]) >= 14).length;
    
    console.log(`   Mattina: ${morningCount} slot (${slots.filter(s => parseInt(s.split(':')[0]) < 14).join(', ')})`);
    console.log(`   Pomeriggio: ${afternoonCount} slot (${slots.filter(s => parseInt(s.split(':')[0]) >= 14).join(', ')})`);
    console.log(`   Totale: ${slots.length} slot`);

    // Verifica se ci sono chiusure automatiche da rimuovere
    console.log('\n🔍 Controllo chiusure automatiche...');
    const closures = await client.query(
      `SELECT id, closure_type, created_by FROM barber_closures
       WHERE barber_email = 'nicolodesantis069@gmail.com' 
       AND closure_date = $1`,
      [dateString]
    );

    if (closures.rows.length > 0) {
      console.log(`   ⚠️  Trovate ${closures.rows.length} chiusure esistenti:`);
      closures.rows.forEach(c => {
        console.log(`      - ${c.closure_type} (creata da: ${c.created_by})`);
      });
      
      // Elimina le chiusure automatiche 'morning'
      const deleted = await client.query(
        `DELETE FROM barber_closures
         WHERE barber_email = 'nicolodesantis069@gmail.com' 
         AND closure_date = $1 
         AND closure_type = 'morning'
         RETURNING id`,
        [dateString]
      );

      if (deleted.rows.length > 0) {
        console.log(`   ✅ Rimosse ${deleted.rows.length} chiusure mattutine automatiche`);
      }
    } else {
      console.log('   ✅ Nessuna chiusura esistente');
    }

    console.log('\n✅ COMPLETATO!');
    console.log('\n💡 Il sistema riconoscerà automaticamente questo schedule come eccezionale.');
    console.log('   Il daily-update NON creerà chiusure automatiche per questa data.\n');

  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Ottieni la data dal comando
const dateArg = process.argv[2];

if (!dateArg) {
  console.log('❌ Errore: Specifica una data\n');
  console.log('Uso: node open-nicolo-morning.mjs YYYY-MM-DD');
  console.log('Esempio: node open-nicolo-morning.mjs 2024-12-25\n');
  process.exit(1);
}

openNicoloMorning(dateArg);
