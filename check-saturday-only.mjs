import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkSaturdaySlots() {
    console.log('🔍 Checking Saturday slots specifically...');
    
    try {
        // Get next few Saturdays
        const saturdays = await sql`
            SELECT date, barber_id, available_slots, unavailable_slots, day_off
            FROM barber_schedules 
            WHERE EXTRACT(DOW FROM date::date) = 6  -- Saturday is day 6
            ORDER BY date, barber_id
            LIMIT 10
        `;
        
        console.log(`\n📅 Found ${saturdays.length} Saturday records:`);
        
        saturdays.forEach(schedule => {
            const availableSlots = JSON.parse(schedule.available_slots || '[]');
            const unavailableSlots = JSON.parse(schedule.unavailable_slots || '[]');
            
            console.log(`\n  📅 ${schedule.date} (${schedule.barber_id})`);
            console.log(`     Day off: ${schedule.day_off}`);
            console.log(`     Available (${availableSlots.length}): ${availableSlots.join(', ')}`);
            console.log(`     Unavailable (${unavailableSlots.length}): ${unavailableSlots.join(', ')}`);
            
            // Check if it has afternoon slots
            const hasAfternoon = availableSlots.some(slot => slot.startsWith('15:') || slot.startsWith('16:') || slot.startsWith('17:'));
            console.log(`     Has afternoon slots: ${hasAfternoon ? '✅' : '❌'}`);
        });

        // Compare with expected slots from API
        const expectedSlots = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
            "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
        ];
        
        console.log(`\n🎯 Expected Saturday slots (${expectedSlots.length}): ${expectedSlots.join(', ')}`);
        
        if (saturdays.length > 0) {
            const firstSaturday = saturdays[0];
            const actualSlots = JSON.parse(firstSaturday.available_slots || '[]');
            
            console.log(`\n🔍 First Saturday comparison:`);
            console.log(`   Expected: ${expectedSlots.length} slots`);
            console.log(`   Actual: ${actualSlots.length} slots`);
            
            const missing = expectedSlots.filter(slot => !actualSlots.includes(slot));
            const extra = actualSlots.filter(slot => !expectedSlots.includes(slot));
            
            if (missing.length > 0) {
                console.log(`   ❌ Missing: ${missing.join(', ')}`);
            }
            if (extra.length > 0) {
                console.log(`   ➕ Extra: ${extra.join(', ')}`);
            }
            if (missing.length === 0 && extra.length === 0) {
                console.log(`   ✅ Perfect match!`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking Saturday slots:', error);
    }
}

checkSaturdaySlots();
