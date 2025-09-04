import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkMarcoData() {
  console.log('🔍 Controllando i dati di Marco...\n');

  try {
    // Verifica se Marco esiste nella tabella barbers
    const marcos = await sql`
      SELECT id, name, email, phone, specialties, is_active 
      FROM barbers 
      WHERE name ILIKE '%marco%' OR id = 'marco'
    `;

    console.log(`📊 Barbieri chiamati Marco trovati: ${marcos.length}`);
    marcos.forEach((marco, index) => {
      console.log(`   ${index + 1}. ID: "${marco.id}" - Nome: "${marco.name}"`);
      console.log(`      Email: ${marco.email || 'N/A'}`);
      console.log(`      Telefono: ${marco.phone || 'N/A'}`);
      console.log(`      Specialità: ${marco.specialties || 'N/A'}`);
      console.log(`      Attivo: ${marco.is_active ? '✅' : '❌'}`);
    });

    if (marcos.length === 0) {
      console.log('❌ Nessun barbiere Marco trovato. Devo crearlo?');
      
      // Mostra tutti i barbieri disponibili
      const allBarbers = await sql`
        SELECT id, name, email, is_active 
        FROM barbers 
        ORDER BY name
      `;
      
      console.log('\n📋 Tutti i barbieri esistenti:');
      allBarbers.forEach((barber, index) => {
        console.log(`   ${index + 1}. ID: "${barber.id}" - Nome: "${barber.name}" (${barber.is_active ? 'Attivo' : 'Inattivo'})`);
      });
      
      return;
    }

    // Se Marco esiste, controlla i suoi schedule esistenti
    const marcoId = marcos[0].id;
    console.log(`\n🗓️ Schedule esistenti per Marco (ID: ${marcoId}):`);
    
    const schedules = await sql`
      SELECT date, available_slots, unavailable_slots, day_off
      FROM barber_schedules 
      WHERE barber_id = ${marcoId}
      ORDER BY date
      LIMIT 10
    `;

    if (schedules.length === 0) {
      console.log('❌ Nessuno schedule trovato per Marco');
    } else {
      console.log(`📅 Trovati ${schedules.length} schedule (mostrando i primi 10):`);
      schedules.forEach((schedule, index) => {
        try {
          const available = schedule.available_slots ? JSON.parse(schedule.available_slots) : [];
          const unavailable = schedule.unavailable_slots ? JSON.parse(schedule.unavailable_slots) : [];
          
          console.log(`\n   ${index + 1}. Data: ${schedule.date}`);
          console.log(`      Day off: ${schedule.day_off ? '✅' : '❌'}`);
          console.log(`      Slot disponibili (${available.length}): ${available.join(', ') || 'Nessuno'}`);
          console.log(`      Slot non disponibili (${unavailable.length}): ${unavailable.join(', ') || 'Nessuno'}`);
          
          // Analizza il pattern degli orari
          if (available.length > 0) {
            const hourlySlots = available.filter(slot => slot.endsWith(':00'));
            const halfHourSlots = available.filter(slot => slot.endsWith(':30'));
            console.log(`      • Orari pieni (${hourlySlots.length}): ${hourlySlots.join(', ')}`);
            console.log(`      • Mezze ore (${halfHourSlots.length}): ${halfHourSlots.join(', ')}`);
          }
        } catch (error) {
          console.log(`      ❌ Errore parsing slots: ${error}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

checkMarcoData();
