// Fix lunch time slots directly in PostgreSQL database
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/maskio_barber'
});

async function fixLunchTimeSlots() {
    console.log('🔧 Fixing lunch time slots (12:00, 12:30)...\n');
    
    try {
        // Get all barbers
        const barbersResult = await pool.query('SELECT id FROM barbers');
        const barbers = barbersResult.rows;
        console.log(`👨‍💼 Found ${barbers.length} barbers: ${barbers.map(b => b.id).join(', ')}`);
        
        // Updated time slots including lunch time
        const correctedTimeSlots = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "12:00", "12:30",  // ← ADDING THESE
            "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
        ];
        
        console.log('✅ Corrected time slots:', correctedTimeSlots.join(', '));
        
        // Update schedules for the next 30 days
        let updatedCount = 0;
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            
            // Skip Sundays (day 0)
            if (date.getDay() === 0) continue;

            for (const barber of barbers) {
                try {
                    // Check if schedule exists
                    const existingResult = await pool.query(
                        'SELECT * FROM barber_schedules WHERE barber_id = $1 AND date = $2',
                        [barber.id, dateString]
                    );
                    
                    if (existingResult.rows.length > 0) {
                        // Update existing schedule
                        console.log(`📅 Updating ${barber.id} for ${dateString}...`);
                        
                        await pool.query(
                            'UPDATE barber_schedules SET available_slots = $1 WHERE barber_id = $2 AND date = $3',
                            [JSON.stringify(correctedTimeSlots), barber.id, dateString]
                        );
                        
                        updatedCount++;
                    } else {
                        // Create new schedule
                        console.log(`📅 Creating schedule for ${barber.id} on ${dateString}...`);
                        
                        await pool.query(
                            'INSERT INTO barber_schedules (barber_id, date, available_slots, unavailable_slots, day_off) VALUES ($1, $2, $3, $4, $5)',
                            [barber.id, dateString, JSON.stringify(correctedTimeSlots), JSON.stringify([]), false]
                        );
                        
                        updatedCount++;
                    }
                } catch (error) {
                    console.error(`❌ Error updating schedule for ${barber.id} on ${dateString}:`, error.message);
                }
            }
        }
        
        console.log(`\n✅ Updated ${updatedCount} schedule records`);
        
        // Verify the fix
        console.log('\n🔍 Verifying the fix...');
        const testDate = '2025-01-27';
        for (const barber of barbers) {
            const scheduleResult = await pool.query(
                'SELECT available_slots FROM barber_schedules WHERE barber_id = $1 AND date = $2',
                [barber.id, testDate]
            );
            
            if (scheduleResult.rows.length > 0) {
                const slots = JSON.parse(scheduleResult.rows[0].available_slots);
                const hasLunch = slots.includes('12:00') && slots.includes('12:30');
                console.log(`👨‍💼 ${barber.id} on ${testDate}: ${hasLunch ? '✅' : '❌'} lunch slots ${hasLunch ? 'INCLUDED' : 'MISSING'}`);
                
                if (hasLunch) {
                    console.log(`   12:00: ✅ Available`);
                    console.log(`   12:30: ✅ Available`);
                } else {
                    console.log(`   Current slots: ${slots.join(', ')}`);
                }
            }
        }
        
        console.log('\n🎉 Lunch time slots fix completed!');
        
    } catch (error) {
        console.error('❌ Error fixing lunch time slots:', error);
    } finally {
        await pool.end();
    }
}

fixLunchTimeSlots().catch(console.error);
