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
    
    // Generate time slots based on day of the week
    const generateSlots = (dayOfWeek) => {
      // Monday (1) - Half day: only afternoon 15:00-17:30
      if (dayOfWeek === 1) {
        return ["15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];
      }
      
      // Saturday (6) - Modified hours: 9:00-12:30, 14:30-17:00
      if (dayOfWeek === 6) {
        return [
          "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
          "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
        ];
      }
      
      // Tuesday-Friday: Full day 9:00-12:30, 15:00-17:30
      return [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
        "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
      ];
    };
    
    const barbers = ['fabio', 'michele', 'marco'];
    let insertedRecords = 0;
    
    // Start from the day after current max date
    let currentDate = new Date(currentMaxDate);
    currentDate.setDate(currentDate.getDate() + 1);
    
    while (currentDate <= targetDate) {
      const dayOfWeek = currentDate.getDay();
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Skip Sundays (day 0)
      if (dayOfWeek !== 0) {
        const timeSlots = generateSlots(dayOfWeek);
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
        
        console.log(`📅 ${dateString} (${dayName}): ${timeSlots.length} slots - ${timeSlots.join(', ')}`);
        
        for (const barberId of barbers) {
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
