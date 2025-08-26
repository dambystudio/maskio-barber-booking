import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function testSaturdaySlots() {
    console.log('🧪 Testing Saturday slots configuration...');
    
    try {
        // Get next Saturday
        const today = new Date();
        let nextSaturday = new Date(today);
        while (nextSaturday.getDay() !== 6) {
            nextSaturday.setDate(nextSaturday.getDate() + 1);
        }
        const saturdayString = nextSaturday.toISOString().split('T')[0];
        
        console.log(`📅 Testing Saturday: ${saturdayString}`);
        
        // Check database slots
        const dbSlots = await sql`
            SELECT barber_id, available_slots
            FROM barber_schedules 
            WHERE date = ${saturdayString}
            ORDER BY barber_id
        `;
        
        console.log('\n📊 Database slots for Saturday:');
        dbSlots.forEach(schedule => {
            const slots = JSON.parse(schedule.available_slots || '[]');
            const has1430 = slots.includes('14:30') ? '✅' : '❌';
            const has1730 = slots.includes('17:30') ? '❌ (should not be here)' : '✅';
            
            console.log(`  ${schedule.barber_id}:`);
            console.log(`    Total slots: ${slots.length}`);
            console.log(`    Has 14:30: ${has1430}`);
            console.log(`    No 17:30: ${has1730}`);
            console.log(`    All slots: ${slots.join(', ')}`);
            console.log('');
        });
        
        // Test API endpoint
        console.log('🌐 Testing API endpoint...');
        const API_BASE = 'http://localhost:3000/api';
        
        for (const schedule of dbSlots) {
            try {
                const response = await fetch(`${API_BASE}/bookings/slots?date=${saturdayString}&barberId=${schedule.barber_id}`);
                if (response.ok) {
                    const apiSlots = await response.json();
                    
                    const has1430 = apiSlots.some(slot => slot.time === '14:30');
                    const has1730 = apiSlots.some(slot => slot.time === '17:30');
                    
                    console.log(`  API ${schedule.barber_id}:`);
                    console.log(`    Total slots: ${apiSlots.length}`);
                    console.log(`    Has 14:30: ${has1430 ? '✅' : '❌'}`);
                    console.log(`    No 17:30: ${!has1730 ? '✅' : '❌ (should not be here)'}`);
                    console.log('');
                } else {
                    console.log(`    ❌ API error for ${schedule.barber_id}: ${response.status}`);
                }
            } catch (error) {
                console.log(`    ❌ API call failed for ${schedule.barber_id}:`, error.message);
            }
        }
        
        // Expected slots
        const expectedSlots = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
            "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
        ];
        
        console.log('🎯 Expected Saturday slots:');
        console.log(`  ${expectedSlots.join(', ')}`);
        console.log(`  Total: ${expectedSlots.length} slots`);
        
    } catch (error) {
        console.error('❌ Error testing Saturday slots:', error);
    }
}

testSaturdaySlots();
