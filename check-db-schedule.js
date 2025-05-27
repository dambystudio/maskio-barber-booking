const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { schedules } = require('./src/lib/schema.ts');

async function checkBarberScheduleInDB() {
    console.log('🔍 Checking barber schedule configuration in database...\n');
    
    try {
        // Connect to database
        const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
        if (!connectionString) {
            console.log('❌ No database connection string found');
            return;
        }
        
        const sql = postgres(connectionString, { ssl: 'require' });
        const db = drizzle(sql);
        
        // Query schedules table
        console.log('📊 Querying schedules table...');
        const allSchedules = await db.select().from(schedules);
        
        console.log(`Found ${allSchedules.length} schedule records:`);
        allSchedules.forEach(schedule => {
            console.log(`\n👨‍💼 Barber: ${schedule.barberId}`);
            console.log(`📅 Date: ${schedule.date}`);
            console.log(`🚫 Day Off: ${schedule.dayOff}`);
            
            if (schedule.availableSlots) {
                const available = JSON.parse(schedule.availableSlots);
                console.log(`✅ Available slots (${available.length}): ${available.join(', ')}`);
                
                // Check specifically for lunch slots
                const hasLunch = available.filter(slot => slot === '12:00' || slot === '12:30');
                if (hasLunch.length > 0) {
                    console.log(`🍽️ Lunch slots in available: ${hasLunch.join(', ')}`);
                } else {
                    console.log(`🍽️ ❌ NO lunch slots (12:00, 12:30) in available slots!`);
                }
            }
            
            if (schedule.unavailableSlots) {
                const unavailable = JSON.parse(schedule.unavailableSlots);
                console.log(`❌ Unavailable slots (${unavailable.length}): ${unavailable.join(', ')}`);
                
                // Check if lunch slots are marked as unavailable
                const lunchUnavailable = unavailable.filter(slot => slot === '12:00' || slot === '12:30');
                if (lunchUnavailable.length > 0) {
                    console.log(`🍽️ ⚠️ Lunch slots marked as UNAVAILABLE: ${lunchUnavailable.join(', ')}`);
                }
            }
        });
        
        await sql.end();
        
    } catch (error) {
        console.error('❌ Error checking database:', error);
    }
}

checkBarberScheduleInDB().catch(console.error);
