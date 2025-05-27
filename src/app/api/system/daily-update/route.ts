// API endpoint for daily system updates - Maskio Barber
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Standard time slots for all barbers
const STANDARD_TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30",  // Lunch time slots
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

export async function POST(request: NextRequest) {
    try {
        console.log('🌅 Starting daily update via API...');
          // Get all active barbers
        const barbers = await sql`SELECT id FROM barbers WHERE is_active = true`;
        
        // Calculate date range: today + next 60 days
        const today = new Date();
        let addedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;
        
        for (let i = 0; i < 60; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            
            // Skip Sundays (barbershop closed)
            if (date.getDay() === 0) {
                skippedCount++;
                continue;
            }
            
            for (const barber of barbers) {
                try {
                    // Check if schedule already exists
                    const existingSchedule = await sql`
                        SELECT id, available_slots FROM barber_schedules 
                        WHERE barber_id = ${barber.id} AND date = ${dateString}
                    `;
                    
                    if (existingSchedule.length === 0) {
                        // Create new schedule for this date
                        await sql`
                            INSERT INTO barber_schedules (barber_id, date, available_slots, unavailable_slots, day_off)
                            VALUES (${barber.id}, ${dateString}, ${JSON.stringify(STANDARD_TIME_SLOTS)}, ${JSON.stringify([])}, false)
                        `;
                        addedCount++;
                    } else {
                        // Check if existing schedule has lunch slots
                        const slots = JSON.parse(existingSchedule[0].available_slots);
                        const hasLunchSlots = slots.includes('12:00') && slots.includes('12:30');
                        
                        if (!hasLunchSlots) {
                            // Update to include lunch slots
                            await sql`
                                UPDATE barber_schedules 
                                SET available_slots = ${JSON.stringify(STANDARD_TIME_SLOTS)}
                                WHERE barber_id = ${barber.id} AND date = ${dateString}
                            `;
                            updatedCount++;
                        }
                    }
                } catch (error) {
                    console.error(`Error processing ${barber.id} on ${dateString}:`, error);
                }
            }
        }
        
        // Clean up old schedules (older than today)
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
          const deletedResult = await sql`
            DELETE FROM barber_schedules 
            WHERE date < ${yesterdayString}
        `;
        
        const summary = {
            success: true,
            timestamp: new Date().toISOString(),
            statistics: {
                newSchedulesAdded: addedCount,
                existingSchedulesUpdated: updatedCount,
                sundaysSkipped: skippedCount,
                oldSchedulesCleaned: Array.isArray(deletedResult) ? deletedResult.length : 0,
                activeBarbersCount: barbers.length
            },
            dateRange: {
                from: today.toISOString().split('T')[0],
                to: new Date(today.getTime() + 59 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
        };
        
        console.log('✅ Daily update completed:', summary);
        
        return NextResponse.json(summary);
        
    } catch (error) {
        console.error('❌ Error in daily update API:', error);
        
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    // Return information about the daily update system
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Check current schedule coverage
        const scheduleCount = await sql`
            SELECT COUNT(*) as total FROM barber_schedules 
            WHERE date >= ${today}
        `;
          const barberCount = await sql`
            SELECT COUNT(*) as total FROM barbers 
            WHERE is_active = true
        `;
        
        return NextResponse.json({
            system: 'Daily Update System',
            status: 'active',
            currentSchedules: parseInt(scheduleCount[0].total),
            activeBarbers: parseInt(barberCount[0].total),
            standardTimeSlots: STANDARD_TIME_SLOTS,
            lastCheck: new Date().toISOString()
        });
        
    } catch (error) {
        return NextResponse.json({
            error: 'Failed to get system status',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
