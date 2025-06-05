import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function fixSaturdayHours() {
    console.log('🔧 Fixing Saturday working hours...');
    
    try {
        // Check current Saturday schedules
        console.log('\n📅 Current Saturday schedules:');
        const currentSaturdays = await sql`
            SELECT date, barber_id, available_slots
            FROM barber_schedules 
            WHERE EXTRACT(DOW FROM date::date) = 6
            ORDER BY date
            LIMIT 5
        `;
        
        currentSaturdays.forEach(schedule => {
            const slots = JSON.parse(schedule.available_slots || '[]');
            console.log(`  ${schedule.date} (${schedule.barber_id}): ${slots.length} slots - ${slots.join(', ')}`);
        });
        
        // Generate correct Saturday slots (same as weekdays: 9:00-12:30, 15:00-17:30)
        function generateCorrectSlots() {
            const slots = [];
            
            // Morning slots 9:00-12:30
            for (let hour = 9; hour <= 12; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    if (hour === 12 && minute > 30) break;
                    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    slots.push(timeString);
                }
            }
            
            // Afternoon slots 15:00-17:30
            for (let hour = 15; hour <= 17; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    if (hour === 17 && minute > 30) break;
                    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    slots.push(timeString);
                }
            }
            
            return slots;
        }
        
        const correctSlots = generateCorrectSlots();
        console.log(`\n✅ Correct Saturday slots (${correctSlots.length}): ${correctSlots.join(', ')}`);
        
        // Update all Saturday schedules
        const updateResult = await sql`
            UPDATE barber_schedules 
            SET available_slots = ${JSON.stringify(correctSlots)}
            WHERE EXTRACT(DOW FROM date::date) = 6
        `;
        
        console.log(`\n🔄 Updated ${updateResult.count} Saturday schedule records`);
        
        // Verify the update
        console.log('\n✅ Updated Saturday schedules:');
        const updatedSaturdays = await sql`
            SELECT date, barber_id, available_slots
            FROM barber_schedules 
            WHERE EXTRACT(DOW FROM date::date) = 6
            ORDER BY date
            LIMIT 5
        `;
        
        updatedSaturdays.forEach(schedule => {
            const slots = JSON.parse(schedule.available_slots || '[]');
            console.log(`  ${schedule.date} (${schedule.barber_id}): ${slots.length} slots - ${slots.join(', ')}`);
        });
        
    } catch (error) {
        console.error('❌ Error fixing Saturday hours:', error);
    }
}

fixSaturdayHours();
