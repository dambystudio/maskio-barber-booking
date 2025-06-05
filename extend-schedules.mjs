import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function extendSchedules() {
  try {
    console.log('🔍 Checking current schedule range...');
    
    // Check current date range
    const rangeResult = await sql`
      SELECT 
        MIN(date) as min_date, 
        MAX(date) as max_date, 
        COUNT(*) as total_records 
      FROM barber_schedules
    `;
    
    console.log('Current schedule range:', rangeResult[0]);
    
    const currentMaxDate = new Date(rangeResult[0].max_date);
    const targetDate = new Date('2025-08-31'); // Extend to end of August
    
    console.log(`\n📅 Extending schedules from ${currentMaxDate.toISOString().split('T')[0]} to ${targetDate.toISOString().split('T')[0]}`);
    
    // Generate the 14 time slots (same as in recreate-database.mjs)
    const timeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
      '12:00', '12:30', '15:00', '15:30', '16:00', '16:30', 
      '17:00', '17:30'
    ];
    
    const barbers = ['fabio', 'michele'];
    let insertedRecords = 0;
    
    // Start from the day after current max date
    let currentDate = new Date(currentMaxDate);
    currentDate.setDate(currentDate.getDate() + 1);
    
    while (currentDate <= targetDate) {
      const dayOfWeek = currentDate.getDay();
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Skip Sundays (day 0)
      if (dayOfWeek !== 0) {        for (const barberId of barbers) {
          try {
            await sql`
              INSERT INTO barber_schedules (barber_id, date, day_off, available_slots, unavailable_slots)
              VALUES (${barberId}, ${dateString}, false, ${JSON.stringify(timeSlots)}, ${JSON.stringify([])})
            `;
            
            insertedRecords++;
          } catch (error) {
            console.error(`Error inserting ${barberId} for ${dateString}:`, error.message);
          }
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`\n✅ Successfully extended schedules!`);
    console.log(`📊 Inserted/updated ${insertedRecords} records`);
    
    // Verify the new range
    const newRangeResult = await sql`
      SELECT 
        MIN(date) as min_date, 
        MAX(date) as max_date, 
        COUNT(*) as total_records 
      FROM barber_schedules
    `;
    
    console.log('\n📈 New schedule range:', newRangeResult[0]);
    
    // Test some July dates
    console.log('\n🧪 Testing July dates availability:');
    const testDates = ['2025-07-05', '2025-07-12', '2025-07-19', '2025-07-26'];
      for (const testDate of testDates) {
      const result = await sql`
        SELECT barber_id, available_slots
        FROM barber_schedules 
        WHERE date = ${testDate}
        ORDER BY barber_id
      `;
      
      console.log(`${testDate}:`);
      result.forEach(row => {
        const slots = JSON.parse(row.available_slots || '[]');
        console.log(`  - ${row.barber_id}: ${slots.length} slots`);
      });
    }
    
    console.log('\n🎉 Schedule extension completed successfully!');
    
  } catch (error) {
    console.error('❌ Error extending schedules:', error);
  }
}

extendSchedules();
