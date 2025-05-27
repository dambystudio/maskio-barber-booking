// Fix lunch time slots comprehensively - Database fix for Maskio Barber
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function fixLunchTimeSlotsComprehensive() {
    console.log('🔧 COMPREHENSIVE FIX: Lunch time slots (12:00, 12:30)...\n');
    
    try {
        // Get all barbers
        const barbers = await sql`SELECT id FROM barbers`;
        console.log(`👨‍💼 Found ${barbers.length} barbers: ${barbers.map(b => b.id).join(', ')}`);
        
        // Correct time slots including lunch time (exactly matching the API generation)
        const correctedTimeSlots = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "12:00", "12:30",  // ← LUNCH TIME SLOTS
            "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
        ];
        
        console.log('✅ Target time slots:', correctedTimeSlots.join(', '));
        console.log('🍽️ Lunch slots: 12:00, 12:30\n');
        
        // Update schedules for the next 60 days (extended range)
        let updatedCount = 0;
        let createdCount = 0;
        
        for (let i = 0; i < 60; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            
            // Skip Sundays (day 0)
            if (date.getDay() === 0) {
                console.log(`📅 Skipping Sunday: ${dateString}`);
                continue;
            }

            for (const barber of barbers) {
                try {
                    // Check if schedule exists
                    const existingSchedule = await sql`
                        SELECT * FROM barber_schedules 
                        WHERE barber_id = ${barber.id} AND date = ${dateString}
                    `;
                    
                    if (existingSchedule.length > 0) {
                        // Update existing schedule
                        await sql`
                            UPDATE barber_schedules 
                            SET available_slots = ${JSON.stringify(correctedTimeSlots)}
                            WHERE barber_id = ${barber.id} AND date = ${dateString}
                        `;
                        updatedCount++;
                        
                        if (i < 7) { // Only log first week to avoid spam
                            console.log(`📅 Updated ${barber.id} for ${dateString}`);
                        }
                    } else {
                        // Create new schedule
                        await sql`
                            INSERT INTO barber_schedules (barber_id, date, available_slots, unavailable_slots, day_off)
                            VALUES (${barber.id}, ${dateString}, ${JSON.stringify(correctedTimeSlots)}, ${JSON.stringify([])}, false)
                        `;
                        createdCount++;
                        
                        if (i < 7) { // Only log first week to avoid spam
                            console.log(`📅 Created schedule for ${barber.id} on ${dateString}`);
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error processing ${barber.id} on ${dateString}:`, error.message);
                }
            }
        }
        
        console.log(`\n✅ Updated ${updatedCount} existing schedule records`);
        console.log(`✅ Created ${createdCount} new schedule records`);
        
        // Comprehensive verification
        console.log('\n🔍 VERIFICATION: Testing multiple dates...');
        const testDates = ['2025-05-27', '2025-05-28', '2025-05-29', '2025-05-30'];
        
        for (const testDate of testDates) {
            console.log(`\n📅 Date: ${testDate}`);
            for (const barber of barbers) {
                const scheduleResult = await sql`
                    SELECT available_slots FROM barber_schedules 
                    WHERE barber_id = ${barber.id} AND date = ${testDate}
                `;
                
                if (scheduleResult.length > 0) {
                    const slots = JSON.parse(scheduleResult[0].available_slots);
                    const hasLunch = slots.includes('12:00') && slots.includes('12:30');
                    
                    if (hasLunch) {
                        console.log(`   👨‍💼 ${barber.id}: ✅ Lunch slots AVAILABLE`);
                    } else {
                        console.log(`   👨‍💼 ${barber.id}: ❌ Missing lunch slots`);
                        console.log(`      Current slots: ${slots.join(', ')}`);
                    }
                } else {
                    console.log(`   👨‍💼 ${barber.id}: ❌ No schedule found`);
                }
            }
        }
        
        console.log('\n🎉 COMPREHENSIVE LUNCH TIME SLOTS FIX COMPLETED!');
        console.log('🌐 Test the booking interface at: http://localhost:3000');
        console.log('🍽️ Look for 12:00 and 12:30 time slots in the booking form');
        
    } catch (error) {
        console.error('❌ Error in comprehensive fix:', error);
    }
}

fixLunchTimeSlotsComprehensive().catch(console.error);
