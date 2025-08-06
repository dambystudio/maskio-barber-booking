// Setup nuovo barbiere: Marco
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

const NUOVO_BARBIERE = {
  id: 'marco',
  name: 'Marco',
  description: 'Apprendista',
  email: 'marcocis2006@gmail.com',
  phone: '+39 331 122 7085',
  specialties: ['Taglio', 'Barba', 'Taglio e Barba'],
  experience: 'Apprendista barbiere in formazione con passione per i tagli moderni.'
};

async function setupMarco() {
  try {
    console.log('🚀 Setup nuovo barbiere:', NUOVO_BARBIERE.name);
    console.log('📧 Email:', NUOVO_BARBIERE.email);
    console.log('📱 Telefono:', NUOVO_BARBIERE.phone);
    
    // 1. Inserisci barbiere nella tabella barbers
    await sql`
      INSERT INTO barbers (
        id, name, email, phone, specialties, experience, is_active
      ) VALUES (
        ${NUOVO_BARBIERE.id},
        ${NUOVO_BARBIERE.name},
        ${NUOVO_BARBIERE.email},
        ${NUOVO_BARBIERE.phone},
        ${JSON.stringify(NUOVO_BARBIERE.specialties)},
        ${NUOVO_BARBIERE.experience},
        true
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        specialties = EXCLUDED.specialties,
        experience = EXCLUDED.experience,
        is_active = true
    `;
    console.log('✅ Barbiere inserito nel database');
    
    // 2. Inserisci user nel sistema di autenticazione
    await sql`
      INSERT INTO users (email, name, role, phone)
      VALUES (
        ${NUOVO_BARBIERE.email},
        ${NUOVO_BARBIERE.name},
        'barber',
        ${NUOVO_BARBIERE.phone}
      )
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = 'barber',
        phone = EXCLUDED.phone
    `;
    console.log('✅ User creato nel sistema di autenticazione');
    
    // 3. Crea schedule per i prossimi 30 giorni
    const workingHours = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
    ];
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);
    
    let schedulesCreated = 0;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      
      // Skip domenica (0)
      if (dayOfWeek === 0) continue;
      
      await sql`
        INSERT INTO barber_schedules (
          barber_id, date, available_slots, day_off
        ) VALUES (
          ${NUOVO_BARBIERE.id},
          ${dateString},
          ${JSON.stringify(workingHours)},
          false
        )
        ON CONFLICT DO NOTHING
      `;
      schedulesCreated++;
    }
    console.log(`✅ ${schedulesCreated} schedule create per i prossimi 30 giorni`);
    
    // 4. Setup chiusure ricorrenti (domenica chiuso)
    await sql`
      INSERT INTO barber_recurring_closures (
        barber_email, closed_days, created_by
      ) VALUES (
        ${NUOVO_BARBIERE.email},
        '[0]',
        'system'
      )
      ON CONFLICT DO NOTHING
    `;
    console.log('✅ Chiusure ricorrenti configurate (domenica chiuso)');
    
    // 5. Verifica che tutto sia stato inserito correttamente
    console.log('\n🔍 Verifica setup...');
    
    const barberCheck = await sql`SELECT * FROM barbers WHERE id = 'marco'`;
    console.log('📋 Barbiere nel DB:', barberCheck[0] ? '✅ Trovato' : '❌ Mancante');
    
    const userCheck = await sql`SELECT * FROM users WHERE email = 'marcocis2006@gmail.com'`;
    console.log('👤 User nel sistema:', userCheck[0] ? '✅ Trovato' : '❌ Mancante');
    
    const scheduleCheck = await sql`SELECT COUNT(*) as count FROM barber_schedules WHERE barber_id = 'marco'`;
    console.log('📅 Schedule configurati:', scheduleCheck[0].count, 'giorni');
    
    console.log('\n🎉 Setup database completato con successo!');
    console.log('\n📋 PROSSIMI PASSI MANUALI:');
    console.log('1. ⚙️  Aggiornare .env.local con email barbiere');
    console.log('2. 🖼️  Aggiungere foto in public/barbers/marco.jpg');
    console.log('3. 🎨 Aggiornare src/data/booking.ts');
    console.log('4. 🔧 Aggiornare BookingForm.tsx per servizi specifici');
    console.log('5. 🔄 Riavviare il server (npm run dev)');
    console.log('6. 🧪 Testare il flusso completo');
    
  } catch (error) {
    console.error('❌ Errore durante setup:', error);
    process.exit(1);
  }
}

setupMarco();
