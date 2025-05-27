// Fix lunch time slots directly in Neon PostgreSQL database
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function fixLunchTimeSlots() {
    console.log('🔧 Fixing lunch time slots (12:00, 12:30)...\n');
    
    try {
        // Get all barbers
        const barbers = await sql`SELECT id FROM barbers`;
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
                    const existingSchedule = await sql`
                        SELECT * FROM barber_schedules 
                        WHERE barber_id = ${barber.id} AND date = ${dateString}
                    `;
                    
                    if (existingSchedule.length > 0) {
                        // Update existing schedule
                        console.log(`📅 Updating ${barber.id} for ${dateString}...`);
                        
                        await sql`
                            UPDATE barber_schedules 
                            SET available_slots = ${JSON.stringify(correctedTimeSlots)}
                            WHERE barber_id = ${barber.id} AND date = ${dateString}
                        `;
                        
                        updatedCount++;
                    } else {
                        // Create new schedule
                        console.log(`📅 Creating schedule for ${barber.id} on ${dateString}...`);
                        
                        await sql`
                            INSERT INTO barber_schedules (barber_id, date, available_slots, unavailable_slots, day_off)
                            VALUES (${barber.id}, ${dateString}, ${JSON.stringify(correctedTimeSlots)}, ${JSON.stringify([])}, false)
                        `;
                        
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
            const scheduleResult = await sql`
                SELECT available_slots FROM barber_schedules 
                WHERE barber_id = ${barber.id} AND date = ${testDate}
            `;
            
            if (scheduleResult.length > 0) {
                const slots = JSON.parse(scheduleResult[0].available_slots);
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
        console.log('🌐 Test the booking interface at: http://localhost:3000');
        
    } catch (error) {
        console.error('❌ Error fixing lunch time slots:', error);
    }
}

fixLunchTimeSlots().catch(console.error);
