import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function checkWaitlistStructure() {
  console.log('🔍 Struttura completa tabella WAITLIST\n');
  
  // Colonne
  const columns = await sql`
    SELECT column_name, data_type, column_default, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'waitlist' 
    ORDER BY ordinal_position
  `;
  
  console.log('📋 COLONNE:');
  columns.forEach(c => {
    const nullable = c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
    const defaultVal = c.column_default ? `DEFAULT ${c.column_default}` : '';
    console.log(`  ${c.column_name.padEnd(25)} ${c.data_type.padEnd(20)} ${nullable.padEnd(10)} ${defaultVal}`);
  });
  
  // Indici
  const indices = await sql`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'waitlist'
  `;
  
  console.log('\n\n📇 INDICI:');
  indices.forEach(i => {
    console.log(`  ${i.indexname}`);
    console.log(`    ${i.indexdef}\n`);
  });
  
  // Esempio di dati
  const rows = await sql`
    SELECT * FROM waitlist 
    ORDER BY created_at DESC 
    LIMIT 3
  `;
  
  console.log('\n📊 ULTIMI 3 RECORD (se presenti):');
  if (rows.length === 0) {
    console.log('  (nessun record presente)\n');
  } else {
    rows.forEach((r, i) => {
      console.log(`\n  Record ${i + 1}:`);
      console.log(`    ID: ${r.id}`);
      console.log(`    Utente: ${r.customer_name} (${r.customer_email})`);
      console.log(`    Barbiere: ${r.barber_name} (ID: ${r.barber_id})`);
      console.log(`    Data: ${r.date}`);
      console.log(`    Servizio: ${r.service} - €${r.price}`);
      console.log(`    Status: ${r.status} | Position: ${r.position}`);
      if (r.offered_time) {
        console.log(`    🎁 Offerta: ${r.offered_time} (scade: ${r.offer_expires_at})`);
        console.log(`    Booking ID offerto: ${r.offered_booking_id}`);
        console.log(`    Risposta: ${r.offer_response || 'in attesa'}`);
      }
      console.log(`    Creato: ${r.created_at}`);
    });
  }
  
  console.log('\n\n✅ Check completato!');
}

checkWaitlistStructure().catch(console.error);
