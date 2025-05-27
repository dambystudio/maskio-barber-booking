// Daily update system for Maskio Barber - Auto-refresh booking dates at midnight
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

// Standard time slots for all barbers
const STANDARD_TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30",  // Lunch time slots
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

async function dailyUpdate() {
    console.log(`🌅 DAILY UPDATE - ${new Date().toISOString()}`);
    console.log('🔄 Refreshing booking system for next 60 days...\n');
    
    try {
        // Get all active barbers
        const barbers = await sql`SELECT id FROM barbers WHERE active = true`;
        console.log(`👨‍💼 Active barbers: ${barbers.map(b => b.id).join(', ')}`);
        
        // Calculate date range: today + next 60 days
        const today = new Date();
        let addedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;
        
        for (let i = 0; i < 60; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            
            // Skip Sundays (barbershop closed)
            if (date.getDay() === 0) {
                skippedCount++;
                continue;
            }
            
            for (const barber of barbers) {
                try {
                    // Check if schedule already exists
                    const existingSchedule = await sql`
                        SELECT id FROM barber_schedules 
                        WHERE barber_id = ${barber.id} AND date = ${dateString}
                    `;
                    
                    if (existingSchedule.length === 0) {
                        // Create new schedule for this date
                        await sql`
                            INSERT INTO barber_schedules (barber_id, date, available_slots, unavailable_slots, day_off)
                            VALUES (${barber.id}, ${dateString}, ${JSON.stringify(STANDARD_TIME_SLOTS)}, ${JSON.stringify([])}, false)
                        `;
                        addedCount++;
                        
                        if (i >= 58) { // Log only the last 2 days added
                            console.log(`➕ Added schedule: ${barber.id} on ${dateString}`);
                        }
                    } else {
                        // Optionally update existing schedules to ensure they have lunch slots
                        const currentSchedule = await sql`
                            SELECT available_slots FROM barber_schedules 
                            WHERE barber_id = ${barber.id} AND date = ${dateString}
                        `;
                        
                        if (currentSchedule.length > 0) {
                            const slots = JSON.parse(currentSchedule[0].available_slots);
                            const hasLunchSlots = slots.includes('12:00') && slots.includes('12:30');
                            
                            if (!hasLunchSlots) {
                                // Update to include lunch slots
                                await sql`
                                    UPDATE barber_schedules 
                                    SET available_slots = ${JSON.stringify(STANDARD_TIME_SLOTS)}
                                    WHERE barber_id = ${barber.id} AND date = ${dateString}
                                `;
                                updatedCount++;
                                
                                if (i < 7) { // Log updates for first week only
                                    console.log(`🔄 Updated schedule: ${barber.id} on ${dateString} (added lunch slots)`);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error processing ${barber.id} on ${dateString}:`, error.message);
                }
            }
        }
        
        // Clean up old schedules (older than today)
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        const deletedResult = await sql`
            DELETE FROM barber_schedules 
            WHERE date < ${yesterdayString}
        `;
        
        console.log('\n📊 DAILY UPDATE SUMMARY:');
        console.log(`➕ New schedules added: ${addedCount}`);
        console.log(`🔄 Existing schedules updated: ${updatedCount}`);
        console.log(`⏭️ Sundays skipped: ${skippedCount}`);
        console.log(`🗑️ Old schedules cleaned: ${deletedResult.count || 0}`);
        console.log(`📅 Date range: ${today.toISOString().split('T')[0]} to ${new Date(today.getTime() + 59 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`);
        
        console.log('\n✅ Daily update completed successfully!');
        
    } catch (error) {
        console.error('❌ Error in daily update:', error);
        throw error;
    }
}

// Schedule daily update at midnight
function scheduleDailyUpdate() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Next midnight
    
    const timeUntilMidnight = midnight.getTime() - now.getTime();
    
    console.log(`🕐 Scheduling next update at: ${midnight.toLocaleString()}`);
    console.log(`⏰ Time until next update: ${Math.round(timeUntilMidnight / (1000 * 60 * 60))} hours`);
    
    setTimeout(() => {
        dailyUpdate().then(() => {
            // Schedule the next update
            scheduleDailyUpdate();
        }).catch(error => {
            console.error('❌ Daily update failed:', error);
            // Try again in 1 hour
            setTimeout(scheduleDailyUpdate, 60 * 60 * 1000);
        });
    }, timeUntilMidnight);
}

// Export functions for manual use and API integration
export { dailyUpdate, scheduleDailyUpdate };

// If run directly, execute daily update immediately
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🔧 Manual execution of daily update...\n');
    dailyUpdate().catch(console.error);
}
