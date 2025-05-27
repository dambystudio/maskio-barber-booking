import { DatabaseService } from './src/lib/database-postgres.ts';

async function fixLunchTimeSlots() {
    console.log('🔧 Fixing lunch time slots (12:00, 12:30)...\n');
    
    try {
        const barbers = await DatabaseService.getAllBarbers();
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
                    // Get existing schedule
                    const existingSchedule = await DatabaseService.getBarberSchedule(barber.id, dateString);
                    
                    if (existingSchedule) {
                        // Update existing schedule with corrected slots
                        console.log(`📅 Updating ${barber.id} for ${dateString}...`);
                        
                        await DatabaseService.setBarberSchedule({
                            barberId: barber.id,
                            date: dateString,
                            availableSlots: JSON.stringify(correctedTimeSlots),
                            unavailableSlots: existingSchedule.unavailableSlots || JSON.stringify([]),
                            dayOff: existingSchedule.dayOff || false,
                        });
                        
                        updatedCount++;
                    } else {
                        // Create new schedule
                        console.log(`📅 Creating schedule for ${barber.id} on ${dateString}...`);
                        
                        await DatabaseService.setBarberSchedule({
                            barberId: barber.id,
                            date: dateString,
                            availableSlots: JSON.stringify(correctedTimeSlots),
                            unavailableSlots: JSON.stringify([]),
                            dayOff: false,
                        });
                        
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
        const testDate = '2025-05-28';
        for (const barber of barbers) {
            const schedule = await DatabaseService.getBarberSchedule(barber.id, testDate);
            if (schedule) {
                const slots = JSON.parse(schedule.availableSlots);
                const hasLunch = slots.includes('12:00') && slots.includes('12:30');
                console.log(`👨‍💼 ${barber.id} on ${testDate}: ${hasLunch ? '✅' : '❌'} lunch slots ${hasLunch ? 'INCLUDED' : 'MISSING'}`);
                
                if (hasLunch) {
                    console.log(`   12:00: ✅ Available`);
                    console.log(`   12:30: ✅ Available`);
                }
            }
        }
        
        console.log('\n🎉 Lunch time slots fix completed!');
        
    } catch (error) {
        console.error('❌ Error fixing lunch time slots:', error);
    }
}

fixLunchTimeSlots().catch(console.error);
