import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function addNicoloBarber() {
  try {
    console.log('👤 AGGIUNTA NUOVO BARBIERE: NICOLÒ\n');

    const email = 'giorgiodesa00@gmail.com';
    const name = 'Nicolò';

    // 1. Verifica se l'utente esiste già
    console.log('🔍 Controllo esistenza utente...');
    const existingUser = await sql`
      SELECT id, email, name, role FROM users 
      WHERE email = ${email}
    `;

    let userId;
    if (existingUser.length > 0) {
      console.log(`✅ Utente esistente trovato: ${existingUser[0].name} (${existingUser[0].email})`);
      console.log(`   Ruolo attuale: ${existingUser[0].role}`);
      userId = existingUser[0].id;

      // Aggiorna il ruolo a 'barber' se necessario
      if (existingUser[0].role !== 'barber') {
        await sql`
          UPDATE users 
          SET role = 'barber'
          WHERE id = ${userId}
        `;
        console.log('✅ Ruolo aggiornato a "barber"');
      }
    } else {
      console.log('⚠️ Utente non trovato. Creazione nuovo utente...');
      const newUser = await sql`
        INSERT INTO users (email, name, role, created_at)
        VALUES (${email}, ${name}, 'barber', NOW())
        RETURNING id
      `;
      userId = newUser[0].id;
      console.log(`✅ Nuovo utente creato con ID: ${userId}`);
    }

    // 2. Verifica se il barbiere esiste già nella tabella barbers
    console.log('\n🔍 Controllo esistenza barbiere...');
    const existingBarber = await sql`
      SELECT id, name FROM barbers WHERE user_id = ${userId}
    `;

    let barberId;
    if (existingBarber.length > 0) {
      console.log(`✅ Barbiere già esistente: ${existingBarber[0].name} (ID: ${existingBarber[0].id})`);
      barberId = existingBarber[0].id;
    } else {
      // Crea il nuovo barbiere con ID 'nicolo'
      barberId = 'nicolo';
      await sql`
        INSERT INTO barbers (
          id,
          user_id,
          name,
          email,
          specialties,
          is_active,
          created_at
        ) VALUES (
          ${barberId},
          ${userId},
          ${name},
          ${email},
          '[]',
          true,
          NOW()
        )
      `;
      console.log(`✅ Nuovo barbiere creato con ID: ${barberId}`);
    }

    // 3. Aggiungi chiusure ricorrenti (giovedì=4, domenica=0)
    console.log('\n� Configurazione chiusure ricorrenti...');
    
    // Controlla se esistono già chiusure ricorrenti per questo barbiere
    const existingRecurring = await sql`
      SELECT id FROM barber_recurring_closures
      WHERE barber_email = ${email}
    `;

    if (existingRecurring.length > 0) {
      // Aggiorna
      await sql`
        UPDATE barber_recurring_closures
        SET closed_days = '[0,4]',
            updated_at = NOW()
        WHERE barber_email = ${email}
      `;
      console.log('✅ Chiusure ricorrenti aggiornate: Domenica (0), Giovedì (4)');
    } else {
      // Inserisci
      await sql`
        INSERT INTO barber_recurring_closures (
          barber_email,
          closed_days,
          created_by,
          created_at,
          updated_at
        ) VALUES (
          ${email},
          '[0,4]',
          'system',
          NOW(),
          NOW()
        )
      `;
      console.log('✅ Chiusure ricorrenti create: Domenica (0), Giovedì (4)');
    }

    // 4. Aggiungi chiusure mattutine per tutti i giorni dal 24 novembre al 15 gennaio
    console.log('\n🌅 Creazione chiusure mattutine (morning) dal 24 novembre 2025 al 15 gennaio 2026...');
    
    // Prima elimina eventuali chiusure esistenti per questo barbiere
    await sql`
      DELETE FROM barber_closures
      WHERE barber_email = ${email}
      AND closure_date >= '2025-11-24'
      AND closure_date <= '2026-01-15'
    `;

    const startDate = new Date('2025-11-24');
    const endDate = new Date('2026-01-15');
    let currentDate = new Date(startDate);
    let morningClosuresCount = 0;

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      await sql`
        INSERT INTO barber_closures (
          barber_email,
          closure_date,
          closure_type,
          reason,
          created_by,
          created_at,
          updated_at
        ) VALUES (
          ${email},
          ${dateStr},
          'morning',
          'Solo appuntamenti pomeridiani',
          'system',
          NOW(),
          NOW()
        )
      `;
      
      morningClosuresCount++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`✅ Create ${morningClosuresCount} chiusure mattutine`);

    // 5. Elimina eventuali schedule esistenti per questo barbiere
    console.log('\n🗑️ Rimozione schedule esistenti...');
    const deleted = await sql`
      DELETE FROM barber_schedules
      WHERE barber_id = ${barberId}
    `;
    console.log(`✅ Rimossi ${deleted.length || 0} schedule esistenti`);

    // 6. Crea gli schedule dal 24 novembre 2025 al 15 gennaio 2026 (come gli altri barbieri)
    console.log('\n📅 Creazione schedule dal 24 novembre 2025 al 15 gennaio 2026...\n');

    const scheduleStartDate = new Date('2025-11-24');
    const scheduleEndDate = new Date('2026-01-15');
    
    let scheduleCount = 0;
    currentDate = new Date(scheduleStartDate);

    while (currentDate <= scheduleEndDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Inserisci schedule per tutti i giorni (le chiusure ricorrenti e mattutine 
      // vengono gestite dalle tabelle barber_recurring_closures e barber_closures)
      await sql`
        INSERT INTO barber_schedules (
          barber_id,
          date,
          day_off,
          created_at,
          updated_at
        ) VALUES (
          ${barberId},
          ${dateStr},
          false,
          NOW(),
          NOW()
        )
      `;

      scheduleCount++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`✅ Creati ${scheduleCount} schedule`);

    // 7. Riepilogo finale
    console.log('\n' + '='.repeat(70));
    console.log('📊 RIEPILOGO OPERAZIONE');
    console.log('='.repeat(70));
    console.log(`👤 Barbiere: ${name}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🆔 User ID: ${userId}`);
    console.log(`🆔 Barber ID: ${barberId}`);
    console.log(`\n📅 Schedule creati: ${scheduleCount} giorni (24 nov 2025 - 15 gen 2026)`);
    console.log(`� Chiusure ricorrenti: Giovedì e Domenica`);
    console.log(`🌅 Chiusure mattutine: ${morningClosuresCount} giorni (24 nov 2025 - 15 gen 2026)`);
    console.log('\n📋 RISULTATO EFFETTIVO:');
    console.log('   ✅ Lunedì: Solo POMERIGGIO (15:00 - 18:00)');
    console.log('   ✅ Martedì: Solo POMERIGGIO (15:00 - 17:30)');
    console.log('   ✅ Mercoledì: Solo POMERIGGIO (15:00 - 17:30)');
    console.log('   🚫 Giovedì: CHIUSO (chiusura ricorrente)');
    console.log('   ✅ Venerdì: Solo POMERIGGIO (15:00 - 17:30)');
    console.log('   ✅ Sabato: Solo POMERIGGIO (14:30 - 17:00)');
    console.log('   🚫 Domenica: CHIUSO (chiusura ricorrente)');
    console.log('\n💡 NOTE:');
    console.log('   - Le chiusure ricorrenti (giovedì/domenica) sono in barber_recurring_closures');
    console.log('   - Le chiusure mattutine sono in barber_closures (tipo: morning)');
    console.log('   - Il barbiere può modificare tutto dal suo pannello gestionale');
    console.log('='.repeat(70));
    console.log('\n✨ Operazione completata con successo!\n');

  } catch (error) {
    console.error('❌ Errore durante l\'operazione:', error);
    throw error;
  }
}

addNicoloBarber();
