import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function manageValentinaBooking() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Cerco la prenotazione di Valentina del 2 gennaio 2025...');
    
    // Cerca e elimina la vecchia prenotazione
    const oldBooking = await client.query(`
      SELECT * FROM bookings 
      WHERE customer_name = 'Valentina' 
      AND booking_date = '2025-01-02'
    `);
    
    if (oldBooking.rows.length > 0) {
      console.log('📌 Trovata prenotazione vecchia:', oldBooking.rows[0]);
      
      await client.query(`
        DELETE FROM bookings 
        WHERE customer_name = 'Valentina' 
        AND booking_date = '2025-01-02'
      `);
      
      console.log('✅ Prenotazione del 2025 eliminata');
    } else {
      console.log('ℹ️ Nessuna prenotazione del 2025 trovata');
    }
    
    // Controlla se esiste già la nuova prenotazione
    const existingNew = await client.query(`
      SELECT * FROM bookings 
      WHERE customer_name = 'Valentina' 
      AND booking_date = '2026-01-02'
    `);
    
    if (existingNew.rows.length > 0) {
      console.log('⚠️ Prenotazione del 2026 già esistente:', existingNew.rows[0]);
      return;
    }
    
    // Inserisci la nuova prenotazione
    console.log('📝 Inserisco la nuova prenotazione del 2 gennaio 2026...');
    
    const result = await client.query(`
      INSERT INTO bookings (
        customer_name,
        customer_phone,
        customer_email,
        service_name,
        barber_name,
        booking_date,
        booking_time,
        status,
        created_at
      ) VALUES (
        'Valentina',
        '+44 7746 120994',
        'valentina@example.com',
        'Taglio',
        'Fabio',
        '2026-01-02',
        '10:00',
        'confirmed',
        NOW()
      )
      RETURNING *
    `);
    
    console.log('✅ Prenotazione inserita con successo!');
    console.log('📋 Dettagli:', result.rows[0]);
    
  } catch (error) {
    console.error('❌ Errore:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

manageValentinaBooking()
  .then(() => {
    console.log('✅ Operazione completata');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Errore fatale:', error);
    process.exit(1);
  });
