import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function fixWorkingHours() {
    console.log('🔧 Fixing working hours to include lunch time slots...');
    
    try {
        // New time slots including 12:00 and 12:30
        const newTimeSlots = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
            "12:00", "12:30", // Adding lunch time slots
            "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
        ];
        
        // Saturday reduced hours (typical for barber shops)
        const saturdayTimeSlots = [
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
            "12:00", "12:30"
        ];
        
        console.log('📅 Updating all schedules...');
        
        // Update weekday schedules (Monday-Friday)
        await sql`
            UPDATE barber_schedules 
            SET available_slots = ${JSON.stringify(newTimeSlots)}
            WHERE EXTRACT(DOW FROM date::date) BETWEEN 1 AND 5
        `;
        
        // Update Saturday schedules (day 6)
        await sql`
            UPDATE barber_schedules 
            SET available_slots = ${JSON.stringify(saturdayTimeSlots)}
            WHERE EXTRACT(DOW FROM date::date) = 6
        `;
        
        console.log('✅ Working hours updated successfully');
        
        // Verify the changes
        const sampleSchedules = await sql`
            SELECT date, EXTRACT(DOW FROM date::date) as day_of_week, available_slots
            FROM barber_schedules 
            WHERE barber_id = 'fabio'
            ORDER BY date
            LIMIT 10
        `;
        
        console.log('📋 Sample updated schedules:');
        sampleSchedules.forEach(schedule => {
            const dayName = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][schedule.day_of_week];
            const slots = JSON.parse(schedule.available_slots);
            console.log(`  ${schedule.date} (${dayName}): ${slots.length} slots - ${slots.slice(0, 3).join(', ')}...${slots.slice(-2).join(', ')}`);
        });
        
    } catch (error) {
        console.error('❌ Error fixing working hours:', error);
    }
}

fixWorkingHours();
