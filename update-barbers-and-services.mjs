import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function updateBarberLabelsAndServices() {
  try {
    console.log('🔄 AGGIORNAMENTO ETICHETTE BARBIERI E SERVIZI\n');

    // 1. Aggiorna specialità barbieri
    console.log('👤 Aggiornamento specialità barbieri...\n');

    // Fabio - Tagli classici
    await sql`
      UPDATE barbers
      SET specialties = '["Tagli classici"]'
      WHERE email = 'fabio.cassano97@icloud.com'
    `;
    console.log('✅ Fabio: Tagli classici');

    // Michele - Tagli moderni
    await sql`
      UPDATE barbers
      SET specialties = '["Tagli moderni"]'
      WHERE email = 'michelebiancofiore0230@gmail.com'
    `;
    console.log('✅ Michele: Tagli moderni');

    // Nicolò - Barba
    await sql`
      UPDATE barbers
      SET specialties = '["Barba"]'
      WHERE email = 'giorgiodesa00@gmail.com'
    `;
    console.log('✅ Nicolò: Barba');

    // 2. Aggiorna servizi (ordine e prezzi)
    console.log('\n💇 Aggiornamento servizi...\n');

    // Taglio - 12€
    await sql`
      UPDATE services
      SET price = 12
      WHERE id = 'taglio'
    `;
    console.log('✅ Taglio: €12');

    // Taglio e Shampoo - 14€
    const shampooExists = await sql`
      SELECT id FROM services WHERE id = 'taglio-shampoo'
    `;

    if (shampooExists.length === 0) {
      await sql`
        INSERT INTO services (id, name, description, price, duration, is_active, created_at)
        VALUES (
          'taglio-shampoo',
          'Taglio e Shampoo',
          'Taglio personalizzato con shampoo',
          14,
          30,
          true,
          NOW()
        )
      `;
      console.log('✅ Taglio e Shampoo: €14 (creato)');
    } else {
      await sql`
        UPDATE services
        SET price = 14, name = 'Taglio e Shampoo', description = 'Taglio personalizzato con shampoo'
        WHERE id = 'taglio-shampoo'
      `;
      console.log('✅ Taglio e Shampoo: €14 (aggiornato)');
    }

    // Taglio e Barba - 15€
    await sql`
      UPDATE services
      SET price = 15, name = 'Taglio e Barba', description = 'Taglio e sistemazione barba professionale'
      WHERE id = 'taglio-e-barba'
    `;
    console.log('✅ Taglio e Barba: €15');

    // Completo - 17€
    const completoExists = await sql`
      SELECT id FROM services WHERE id = 'completo'
    `;

    if (completoExists.length === 0) {
      await sql`
        INSERT INTO services (id, name, description, price, duration, is_active, created_at)
        VALUES (
          'completo',
          'Completo',
          'Taglio, barba e shampoo',
          17,
          45,
          true,
          NOW()
        )
      `;
      console.log('✅ Completo: €17 (creato)');
    } else {
      await sql`
        UPDATE services
        SET price = 17, name = 'Completo', description = 'Taglio, barba e shampoo', duration = 45
        WHERE id = 'completo'
      `;
      console.log('✅ Completo: €17 (aggiornato)');
    }

    // 3. Verifica finale
    console.log('\n📊 VERIFICA FINALE:\n');

    const barbers = await sql`
      SELECT name, email, specialties FROM barbers WHERE is_active = true
      ORDER BY name
    `;

    console.log('👥 BARBIERI:');
    barbers.forEach(b => {
      const specs = JSON.parse(b.specialties || '[]');
      console.log(`   ${b.name}: ${specs.join(', ')}`);
    });

    const services = await sql`
      SELECT id, name, price FROM services WHERE is_active = true
      ORDER BY price
    `;

    console.log('\n💇 SERVIZI:');
    services.forEach(s => {
      console.log(`   ${s.name}: €${s.price}`);
    });

    console.log('\n✨ Aggiornamento completato con successo!\n');

  } catch (error) {
    console.error('❌ Errore:', error);
    throw error;
  }
}

updateBarberLabelsAndServices();
