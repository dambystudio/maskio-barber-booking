import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function updateMondaySchedules() {
    console.log('🔧 Updating Monday schedules to half-day (afternoon only)...');
    
    try {
        // New Monday slots: only afternoon 15:00-17:30
        const mondayAfternoonSlots = [
            "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
        ];
        
        console.log('🎯 New Monday slots (afternoon only):', mondayAfternoonSlots.join(', '));
        
        // Get all Monday schedules
        const mondays = await sql`
            SELECT id, date, barber_id, available_slots
            FROM barber_schedules 
            WHERE EXTRACT(DOW FROM date::date) = 1  -- Monday is day 1
        `;
        
        console.log(`📅 Found ${mondays.length} Monday schedules to update`);
        
        let updatedCount = 0;
        
        for (const monday of mondays) {
            const currentSlots = JSON.parse(monday.available_slots || '[]');
            
            // Check if update is needed (if contains morning slots)
            const hasMorningSlots = currentSlots.some(slot => {
                const hour = parseInt(slot.split(':')[0]);
                return hour < 15; // Any slot before 15:00
            });
            
            if (hasMorningSlots || JSON.stringify(currentSlots.sort()) !== JSON.stringify(mondayAfternoonSlots.sort())) {
                // Update with new afternoon-only slots
                await sql`
                    UPDATE barber_schedules
                    SET available_slots = ${JSON.stringify(mondayAfternoonSlots)}
                    WHERE id = ${monday.id}
                `;
                
                console.log(`✅ Updated ${monday.date} for ${monday.barber_id}`);
                console.log(`   Old: ${currentSlots.join(', ')}`);
                console.log(`   New: ${mondayAfternoonSlots.join(', ')}`);
                updatedCount++;
            } else {
                console.log(`⏩ ${monday.date} for ${monday.barber_id} already up to date`);
            }
        }
        
        console.log(`\n🎉 Updated ${updatedCount} Monday schedules`);
        
        // Verify the update
        console.log('\n✅ Verification - Updated Monday schedules:');
        const updatedMondays = await sql`
            SELECT date, barber_id, available_slots
            FROM barber_schedules
            WHERE EXTRACT(DOW FROM date::date) = 1
            ORDER BY date
            LIMIT 10
        `;
        
        updatedMondays.forEach(schedule => {
            const slots = JSON.parse(schedule.available_slots || '[]');
            const hasOnlyAfternoon = slots.every(slot => {
                const hour = parseInt(slot.split(':')[0]);
                return hour >= 15; // All slots 15:00 or later
            });
            const afternoonCheck = hasOnlyAfternoon ? '✅' : '❌';
            
            console.log(`  ${schedule.date} (${schedule.barber_id}): ${afternoonCheck} afternoon only | Total: ${slots.length} slots`);
            console.log(`    Slots: ${slots.join(', ')}`);
        });
        
    } catch (error) {
        console.error('❌ Error updating Monday schedules:', error);
    }
}

updateMondaySchedules();
