import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function fixAllAvailabilityIssues() {
    console.log('🔧 Fixing all availability issues...');
    
    try {
        // Generate correct time slots for all working days
        function generateCorrectTimeSlots(dayOfWeek) {
            const slots = [];
            
            // Sunday closed
            if (dayOfWeek === 0) {
                return slots;
            }
            
            // All other days (Monday-Saturday): 9:00-12:30, 15:00-17:30
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
        
        // 1. First, clear existing schedules
        console.log('\n🧹 Clearing existing schedules...');
        await sql`DELETE FROM barber_schedules`;
        
        // 2. Generate schedules for 60 days starting from today
        console.log('📅 Generating 60 days of schedules...');
        const barbers = ['fabio', 'michele'];
        const today = new Date();
        
        let totalRecords = 0;
        
        for (let i = 0; i < 60; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);
            const dateString = currentDate.toISOString().split('T')[0];
            const dayOfWeek = currentDate.getDay();
            
            const timeSlots = generateCorrectTimeSlots(dayOfWeek);
            
            // Skip if no slots (Sunday)
            if (timeSlots.length === 0) {
                continue;
            }
            
            // Create schedule for each barber
            for (const barberId of barbers) {
                await sql`
                    INSERT INTO barber_schedules 
                    (barber_id, date, available_slots, unavailable_slots, day_off)
                    VALUES (
                        ${barberId},
                        ${dateString},
                        ${JSON.stringify(timeSlots)},
                        '[]',
                        false
                    )
                `;
                totalRecords++;
            }
        }
        
        console.log(`✅ Created ${totalRecords} schedule records`);
        
        // 3. Verify the fix
        console.log('\n✅ Verification:');
        
        // Check Friday afternoon
        const testFriday = await sql`
            SELECT date, barber_id, available_slots
            FROM barber_schedules 
            WHERE EXTRACT(DOW FROM date::date) = 5
            ORDER BY date
            LIMIT 2
        `;
        
        console.log('Friday afternoon slots:');
        testFriday.forEach(schedule => {
            const slots = JSON.parse(schedule.available_slots);
            const afternoonSlots = slots.filter(slot => {
                const hour = parseInt(slot.split(':')[0]);
                return hour >= 15;
            });
            console.log(`  ${schedule.date} (${schedule.barber_id}): ${afternoonSlots.join(', ')}`);
        });
        
        // Check Saturday slots
        const testSaturday = await sql`
            SELECT date, barber_id, available_slots
            FROM barber_schedules 
            WHERE EXTRACT(DOW FROM date::date) = 6
            ORDER BY date
            LIMIT 2
        `;
        
        console.log('Saturday slots:');
        testSaturday.forEach(schedule => {
            const slots = JSON.parse(schedule.available_slots);
            console.log(`  ${schedule.date} (${schedule.barber_id}): ${slots.length} total slots - ${slots.join(', ')}`);
        });
        
        // Check date range
        const dateRange = await sql`
            SELECT 
                MIN(date) as earliest_date,
                MAX(date) as latest_date,
                COUNT(*) as total_records
            FROM barber_schedules
        `;
        
        console.log(`Date range: ${dateRange[0].earliest_date} to ${dateRange[0].latest_date}`);
        console.log(`Total records: ${dateRange[0].total_records}`);
        
    } catch (error) {
        console.error('❌ Error fixing availability issues:', error);
    }
}

fixAllAvailabilityIssues();
