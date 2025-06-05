import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function addSaturdaySlots() {
    console.log('🔧 Adding Saturday slots to database...');
    
    try {
        // Saturday slots (same as weekdays)
        const saturdaySlots = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
            "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
        ];
        
        const barbers = ['fabio', 'michele'];
        
        // Get Saturdays for next 10 weeks
        const saturdays = [];
        const today = new Date();
        
        for (let i = 0; i < 70; i++) { // 70 days = 10 weeks
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            if (date.getDay() === 6) { // Saturday
                saturdays.push(date.toISOString().split('T')[0]);
            }
        }
        
        console.log(`📅 Found ${saturdays.length} Saturdays to process`);
        
        let added = 0;
        
        for (const saturday of saturdays) {
            for (const barberId of barbers) {
                // Check if already exists
                const existing = await sql`
                    SELECT id FROM barber_schedules 
                    WHERE barber_id = ${barberId} AND date = ${saturday}
                `;
                
                if (existing.length === 0) {
                    // Add Saturday schedule
                    await sql`
                        INSERT INTO barber_schedules (
                            barber_id, 
                            date, 
                            available_slots, 
                            unavailable_slots, 
                            day_off
                        ) VALUES (
                            ${barberId}, 
                            ${saturday}, 
                            ${JSON.stringify(saturdaySlots)}, 
                            ${JSON.stringify([])}, 
                            false
                        )
                    `;
                    
                    console.log(`✅ Added Saturday ${saturday} for ${barberId}`);
                    added++;
                } else {
                    console.log(`⏩ Saturday ${saturday} for ${barberId} already exists`);
                }
            }
        }
        
        console.log(`\n🎉 Total Saturday schedules added: ${added}`);
        
        // Test the first Saturday
        if (saturdays.length > 0) {
            const testSaturday = saturdays[0];
            console.log(`\n🧪 Testing ${testSaturday}...`);
            
            const testResult = await sql`
                SELECT barber_id, available_slots 
                FROM barber_schedules 
                WHERE date = ${testSaturday}
                ORDER BY barber_id
            `;
            
            testResult.forEach(row => {
                const slots = JSON.parse(row.available_slots);
                console.log(`   ${row.barber_id}: ${slots.length} slots`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error adding Saturday slots:', error);
    }
}

addSaturdaySlots();
