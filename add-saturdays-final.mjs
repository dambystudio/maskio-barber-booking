import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function addSaturdays() {
    console.log('🔧 Adding Saturday schedules manually...');
    
    try {
        const saturdaySlots = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
            "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
        ];
        
        const barbers = ['fabio', 'michele'];
        
        // Find Saturdays in the next 60 days
        const today = new Date();
        let count = 0;
        
        for (let i = 0; i < 60; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            // If it's Saturday (day 6)
            if (date.getDay() === 6) {
                const dateStr = date.toISOString().split('T')[0];
                console.log(`📅 Processing Saturday: ${dateStr}`);
                
                for (const barberId of barbers) {
                    // Check if already exists
                    const existing = await sql`
                        SELECT id FROM barber_schedules 
                        WHERE barber_id = ${barberId} AND date = ${dateStr}
                    `;
                    
                    if (existing.length === 0) {
                        await sql`
                            INSERT INTO barber_schedules (
                                barber_id, date, available_slots, unavailable_slots, day_off
                            ) VALUES (
                                ${barberId}, 
                                ${dateStr}, 
                                ${JSON.stringify(saturdaySlots)}, 
                                ${JSON.stringify([])}, 
                                false
                            )
                        `;
                        console.log(`✅ Added Saturday schedule for ${barberId}`);
                        count++;
                    } else {
                        console.log(`⚠️ Saturday schedule already exists for ${barberId}`);
                    }
                }
            }
        }
        
        console.log(`\n🎉 Added ${count} Saturday schedules`);
        
        // Verify
        const saturdayCheck = await sql`
            SELECT COUNT(*) as count FROM barber_schedules 
            WHERE EXTRACT(DOW FROM date::date) = 6
        `;
        
        console.log(`✅ Total Saturday records now: ${saturdayCheck[0].count}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

addSaturdays();
