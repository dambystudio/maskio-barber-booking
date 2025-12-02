const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'maskio_barber',
});

async function deleteAllBookings() {
  try {
    console.log('Deleting all bookings...');
    const result = await pool.query('DELETE FROM bookings');
    console.log(`All bookings deleted successfully! Deleted ${result.rowCount} rows.`);
    
  } catch (error) {
    console.error('Error deleting bookings:', error);
  } finally {
    await pool.end();
  }
}

deleteAllBookings();
