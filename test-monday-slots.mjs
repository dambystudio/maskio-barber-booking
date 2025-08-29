import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function testMondaySlots() {
    console.log('🧪 Testing Monday half-day configuration...');
    
    try {
        // Get next Monday
        const today = new Date();
        let nextMonday = new Date(today);
        while (nextMonday.getDay() !== 1) {
            nextMonday.setDate(nextMonday.getDate() + 1);
        }
        const mondayString = nextMonday.toISOString().split('T')[0];
        
        console.log(`📅 Testing Monday: ${mondayString}`);
        
        // 1. Check database slots
        console.log('\n📊 Database slots for Monday:');
        const dbSlots = await sql`
            SELECT barber_id, available_slots
            FROM barber_schedules 
            WHERE date = ${mondayString}
            ORDER BY barber_id
        `;
        
        if (dbSlots.length === 0) {
            console.log('⚠️ No Monday schedules found in database');
        } else {
            dbSlots.forEach(schedule => {
                const slots = JSON.parse(schedule.available_slots || '[]');
                const hasOnlyAfternoon = slots.every(slot => {
                    const hour = parseInt(slot.split(':')[0]);
                    return hour >= 15; // All slots 15:00 or later
                });
                const afternoonCheck = hasOnlyAfternoon ? '✅' : '❌';
                
                console.log(`  ${schedule.barber_id}:`);
                console.log(`    Total slots: ${slots.length}`);
                console.log(`    Afternoon only: ${afternoonCheck}`);
                console.log(`    Slots: ${slots.join(', ')}`);
                console.log('');
            });
        }
        
        // 2. Test API endpoint (if server is running)
        console.log('🌐 Testing API endpoint...');
        const API_BASE = 'http://localhost:3000/api';
        
        try {
            for (const schedule of dbSlots) {
                const response = await fetch(`${API_BASE}/bookings/slots?date=${mondayString}&barberId=${schedule.barber_id}`);
                if (response.ok) {
                    const apiSlots = await response.json();
                    const afternoonSlots = apiSlots.filter(slot => {
                        const hour = parseInt(slot.time.split(':')[0]);
                        return hour >= 15 && slot.available;
                    });
                    const morningSlots = apiSlots.filter(slot => {
                        const hour = parseInt(slot.time.split(':')[0]);
                        return hour < 15 && slot.available;
                    });
                    
                    console.log(`  API ${schedule.barber_id}:`);
                    console.log(`    Total available slots: ${apiSlots.filter(s => s.available).length}`);
                    console.log(`    Morning slots: ${morningSlots.length} (should be 0)`);
                    console.log(`    Afternoon slots: ${afternoonSlots.length} (should be 6)`);
                    
                    if (morningSlots.length === 0 && afternoonSlots.length === 6) {
                        console.log(`    ✅ Monday half-day working correctly!`);
                    } else {
                        console.log(`    ❌ Monday configuration not working properly`);
                    }
                    console.log('');
                } else {
                    console.log(`    ❌ API error for ${schedule.barber_id}: ${response.status}`);
                }
            }
        } catch (error) {
            console.log('    ⚠️ API test skipped (server not running)');
        }
        
        // 3. Compare with other days
        console.log('📊 Comparison with other days:');
        
        // Get Tuesday (full day)
        let nextTuesday = new Date(nextMonday);
        nextTuesday.setDate(nextTuesday.getDate() + 1);
        const tuesdayString = nextTuesday.toISOString().split('T')[0];
        
        const tuesdaySlots = await sql`
            SELECT barber_id, available_slots
            FROM barber_schedules 
            WHERE date = ${tuesdayString}
            ORDER BY barber_id
            LIMIT 1
        `;
        
        if (tuesdaySlots.length > 0) {
            const tuesdaySlotsList = JSON.parse(tuesdaySlots[0].available_slots || '[]');
            const mondaySlotsList = JSON.parse(dbSlots[0]?.available_slots || '[]');
            
            console.log(`  Tuesday (${tuesdayString}): ${tuesdaySlotsList.length} slots`);
            console.log(`    ${tuesdaySlotsList.join(', ')}`);
            console.log(`  Monday (${mondayString}): ${mondaySlotsList.length} slots`);
            console.log(`    ${mondaySlotsList.join(', ')}`);
            
            if (tuesdaySlotsList.length > mondaySlotsList.length) {
                console.log('  ✅ Monday has fewer slots than Tuesday (correct for half-day)');
            } else {
                console.log('  ❌ Monday should have fewer slots than Tuesday');
            }
        }
        
        // Expected Monday slots
        const expectedMondaySlots = ["15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];
        console.log(`\n🎯 Expected Monday slots: ${expectedMondaySlots.join(', ')}`);
        
        console.log('\n🎉 Monday half-day test completed!');
        
    } catch (error) {
        console.error('❌ Error testing Monday slots:', error);
    }
}

testMondaySlots();
