import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function updateSaturdaySlots() {
    console.log('🔧 Updating Saturday slots: Adding 14:30, removing 17:30...');
    
    try {
        // New Saturday slots with 14:30 added and 17:30 removed
        const newSaturdaySlots = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
            "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
        ];
        
        console.log('🎯 New Saturday slots:', newSaturdaySlots.join(', '));
        
        // Get all Saturday schedules
        const saturdays = await sql`
            SELECT id, date, barber_id, available_slots
            FROM barber_schedules 
            WHERE EXTRACT(DOW FROM date::date) = 6
        `;
        
        console.log(`📅 Found ${saturdays.length} Saturday schedules to update`);
        
        let updatedCount = 0;
        
        for (const saturday of saturdays) {
            const currentSlots = JSON.parse(saturday.available_slots || '[]');
            
            // Check if update is needed
            const hasOldSlots = currentSlots.includes('17:30');
            const missingNewSlot = !currentSlots.includes('14:30');
            
            if (hasOldSlots || missingNewSlot) {
                // Update with new slots
                await sql`
                    UPDATE barber_schedules
                    SET available_slots = ${JSON.stringify(newSaturdaySlots)}
                    WHERE id = ${saturday.id}
                `;
                
                console.log(`✅ Updated ${saturday.date} for ${saturday.barber_id}`);
                updatedCount++;
            } else {
                console.log(`⏩ ${saturday.date} for ${saturday.barber_id} already up to date`);
            }
        }
        
        console.log(`\n🎉 Updated ${updatedCount} Saturday schedules`);
        
        // Verify the update
        console.log('\n✅ Verification - Updated Saturday schedules:');
        const updatedSaturdays = await sql`
            SELECT date, barber_id, available_slots
            FROM barber_schedules
            WHERE EXTRACT(DOW FROM date::date) = 6
            ORDER BY date
            LIMIT 5
        `;
        
        updatedSaturdays.forEach(schedule => {
            const slots = JSON.parse(schedule.available_slots || '[]');
            const has1430 = slots.includes('14:30') ? '✅' : '❌';
            const has1730 = slots.includes('17:30') ? '❌' : '✅';
            
            console.log(`  ${schedule.date} (${schedule.barber_id}): ${has1430} 14:30 | ${has1730} no 17:30 | Total: ${slots.length} slots`);
        });
        
    } catch (error) {
        console.error('❌ Error updating Saturday slots:', error);
    }
}

updateSaturdaySlots();
