import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function fixSaturdaySchedules() {
    console.log('🔧 Fixing Saturday schedules...');
    
    try {
        // Generate Saturday slots (same as weekdays: 9:00-12:30, 15:00-17:30)
        const saturdaySlots = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
            "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
        ];
        
        console.log(`🎯 Saturday slots to create: ${saturdaySlots.join(', ')}`);
        
        // Get date range to work with (next 60 days)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 60);
        
        console.log(`📅 Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
        
        const barbers = ['fabio', 'michele'];
        let saturdaysCreated = 0;
        
        // Generate schedules for each Saturday in the range
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            
            // If it's Saturday (day 6)
            if (dayOfWeek === 6) {
                const dateStr = d.toISOString().split('T')[0];
                
                for (const barberId of barbers) {
                    // Check if record already exists
                    const existing = await sql`
                        SELECT id FROM barber_schedules 
                        WHERE barber_id = ${barberId} AND date = ${dateStr}
                    `;
                    
                    if (existing.length === 0) {
                        // Create Saturday schedule
                        await sql`
                            INSERT INTO barber_schedules (
                                barber_id, date, available_slots, unavailable_slots, day_off, created_at
                            ) VALUES (
                                ${barberId}, 
                                ${dateStr}, 
                                ${JSON.stringify(saturdaySlots)}, 
                                ${JSON.stringify([])}, 
                                false, 
                                NOW()
                            )
                        `;
                        
                        console.log(`✅ Created Saturday schedule for ${barberId} on ${dateStr}`);
                        saturdaysCreated++;
                    } else {
                        // Update existing Saturday schedule with correct slots
                        await sql`
                            UPDATE barber_schedules 
                            SET available_slots = ${JSON.stringify(saturdaySlots)},
                                unavailable_slots = ${JSON.stringify([])},
                                day_off = false
                            WHERE barber_id = ${barberId} AND date = ${dateStr}
                        `;
                        
                        console.log(`🔄 Updated Saturday schedule for ${barberId} on ${dateStr}`);
                        saturdaysCreated++;
                    }
                }
            }
        }
        
        console.log(`\n🎉 Saturday schedules processed: ${saturdaysCreated}`);
        
        // Verify the fix
        const saturdayCheck = await sql`
            SELECT date, barber_id, available_slots
            FROM barber_schedules 
            WHERE EXTRACT(DOW FROM date::date) = 6
            ORDER BY date, barber_id
            LIMIT 4
        `;
        
        console.log(`\n✅ Verification - Saturday records now: ${saturdayCheck.length}`);
        saturdayCheck.forEach(schedule => {
            const slots = JSON.parse(schedule.available_slots);
            console.log(`   ${schedule.date} (${schedule.barber_id}): ${slots.length} slots`);
        });
        
    } catch (error) {
        console.error('❌ Error fixing Saturday schedules:', error);
    }
}

fixSaturdaySchedules();
