// Test database connection
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
dotenv.config();

async function testDatabase() {
    try {
        const sql = neon(process.env.DATABASE_URL);
        
        // Test the daily update endpoint logic
        console.log('🧪 Testing daily update logic...');
        
        // Get all active barbers (using correct column name)
        const barbers = await sql`SELECT id FROM barbers WHERE is_active = true`;
        console.log('✅ Active barbers:', barbers.length);
        
        // Test if we can query barber_schedules
        const today = new Date().toISOString().split('T')[0];
        const schedules = await sql`
            SELECT COUNT(*) as count FROM barber_schedules 
            WHERE date >= ${today}
        `;
        console.log('✅ Current schedules count:', schedules[0].count);
        
        // Test inserting a schedule (simulating the daily update)
        const testDate = '2025-05-28';
        const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];
        
        console.log('🧪 Testing schedule insertion...');
        for (const barber of barbers) {
            // Check if schedule exists
            const existing = await sql`
                SELECT id FROM barber_schedules 
                WHERE barber_id = ${barber.id} AND date = ${testDate}
            `;
            
            if (existing.length === 0) {
                await sql`
                    INSERT INTO barber_schedules (barber_id, date, available_slots, unavailable_slots, day_off)
                    VALUES (${barber.id}, ${testDate}, ${JSON.stringify(timeSlots)}, ${JSON.stringify([])}, false)
                `;
                console.log(`✅ Created schedule for ${barber.id} on ${testDate}`);
            } else {
                console.log(`ℹ️ Schedule already exists for ${barber.id} on ${testDate}`);
            }
        }
        
        console.log('🎉 Database test completed successfully!');
        
    } catch (error) {
        console.error('❌ Database error:', error);
    }
}

testDatabase();
