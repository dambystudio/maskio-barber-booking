// Verify lunch time slots fix
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://neondb_owner:npg_Wj09qDUmTsxE@ep-old-forest-a2ur722g-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function verifyFix() {
    console.log('🔍 Verifying lunch time slots fix...\n');
    
    try {
        // Get all barbers
        const barbers = await sql`SELECT id FROM barbers`;
        
        // Check schedules for today and the next few days
        const testDates = ['2025-01-27', '2025-05-28', '2025-05-29'];
        
        for (const testDate of testDates) {
            console.log(`📅 Checking schedules for ${testDate}:`);
            
            for (const barber of barbers) {
                const scheduleResult = await sql`
                    SELECT available_slots FROM barber_schedules 
                    WHERE barber_id = ${barber.id} AND date = ${testDate}
                `;
                
                if (scheduleResult.length > 0) {
                    const slots = JSON.parse(scheduleResult[0].available_slots);
                    const hasLunch = slots.includes('12:00') && slots.includes('12:30');
                    console.log(`  👨‍💼 ${barber.id}: ${hasLunch ? '✅' : '❌'} lunch slots ${hasLunch ? 'AVAILABLE' : 'MISSING'}`);
                    
                    if (hasLunch) {
                        console.log(`     12:00: ✅ Available`);
                        console.log(`     12:30: ✅ Available`);
                    } else {
                        console.log(`     Current slots: ${slots.join(', ')}`);
                    }
                } else {
                    console.log(`  👨‍💼 ${barber.id}: ❌ No schedule found`);
                }
            }
            console.log('');
        }
        
        // Show a sample of available slots
        console.log('🎯 Sample barber schedule (Fabio, 2025-05-28):');
        const sampleSchedule = await sql`
            SELECT available_slots FROM barber_schedules 
            WHERE barber_id = 'fabio' AND date = '2025-05-28'
        `;
        
        if (sampleSchedule.length > 0) {
            const slots = JSON.parse(sampleSchedule[0].available_slots);
            console.log(`All available slots: ${slots.join(', ')}`);
            
            const lunchSlots = slots.filter(slot => slot === '12:00' || slot === '12:30');
            console.log(`Lunch slots: ${lunchSlots.join(', ')} ${lunchSlots.length === 2 ? '✅' : '❌'}`);
        }
        
        console.log('\n🎉 Verification completed!');
        console.log('📝 Next steps:');
        console.log('   1. Start the application: npm run dev');
        console.log('   2. Go to: http://localhost:3000');
        console.log('   3. Test booking at 12:00 and 12:30');
        
    } catch (error) {
        console.error('❌ Error verifying fix:', error);
    }
}

verifyFix().catch(console.error);
