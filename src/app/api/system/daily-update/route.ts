// API endpoint for daily system updates - Maskio Barber
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Standard time slots for all barbers (Tuesday-Friday)
const STANDARD_TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30",  // Lunch time slots
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

// Michele's Monday afternoon slots (15:00-18:00)
const MICHELE_MONDAY_SLOTS = [
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
];

// Saturday slots (9:00-12:30, 14:30, 15:00-17:00)
const SATURDAY_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
];

// Helper function to check if a barber is closed on a specific day of week
async function isBarberClosedOnDay(barberEmail: string, dayOfWeek: number): Promise<boolean> {
    try {
        const closures = await sql`
            SELECT closed_days FROM barber_recurring_closures
            WHERE barber_email = ${barberEmail}
        `;
        
        if (closures.length > 0) {
            const closedDays = JSON.parse(closures[0].closed_days);
            return closedDays.includes(dayOfWeek);
        }
        
        return false;
    } catch (error) {
        console.error('Error checking barber closure:', error);
        return false;
    }
}

// Helper function to get correct slots for a barber on a specific day
function getSlotsForBarberAndDay(barberEmail: string, dayOfWeek: number): string[] {
    // Monday (1) special handling
    if (dayOfWeek === 1) {
        if (barberEmail === 'michelebiancofiore0230@gmail.com') {
            // Michele: afternoon only 15:00-18:00
            return MICHELE_MONDAY_SLOTS;
        } else if (barberEmail === 'fabio.cassano97@icloud.com') {
            // Fabio: closed on Monday
            return [];
        }
    }
    
    // Saturday (6) special handling
    if (dayOfWeek === 6) {
        // Both barbers: 9:00-12:30, 14:30, 15:00-17:00 (NO 17:30)
        return SATURDAY_SLOTS;
    }
    
    // Other days (Tuesday-Friday): standard slots
    return STANDARD_TIME_SLOTS;
}

export async function POST(request: NextRequest) {
    try {
        console.log('🌅 Starting daily update via API...');
          // Get all active barbers with their email
        const barbers = await sql`SELECT id, email FROM barbers WHERE is_active = true`;
        
        // ✅ PROTECTED DATES: These dates should NEVER be modified by daily-update
        // They are manually configured exceptional openings
        const PROTECTED_DATES = [
            '2025-10-30', // Michele exceptional opening on Thursday
            '2025-12-22', // Christmas Monday - both barbers full day
            '2025-12-29'  // Christmas Monday - both barbers full day
        ];
        
        // Calculate date range: today + next 60 days
        const today = new Date();
        let addedCount = 0;
        let updatedCount = 0;
        let skippedSundaysCount = 0;
        let skippedExceptionalCount = 0;
        let skippedProtectedCount = 0;
        
        for (let i = 0; i < 60; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            const dayOfWeek = date.getDay();
            
            // Skip Sundays (barbershop closed)
            if (dayOfWeek === 0) {
                skippedSundaysCount++;
                continue;
            }
            
            // ✅ Skip protected dates (manually configured exceptional openings)
            if (PROTECTED_DATES.includes(dateString)) {
                skippedProtectedCount++;
                console.log(`⚠️ Skipping protected date: ${dateString}`);
                continue;
            }
            
            for (const barber of barbers) {
                try {
                    // Get correct slots for this barber and day
                    const slotsForDay = getSlotsForBarberAndDay(barber.email, dayOfWeek);
                    const isDayOff = slotsForDay.length === 0;
                    
                    // Check if barber has recurring closure for this day
                    const isRecurringClosed = await isBarberClosedOnDay(barber.email, dayOfWeek);
                    
                    // Check if schedule already exists
                    const existingSchedule = await sql`
                        SELECT id, available_slots FROM barber_schedules 
                        WHERE barber_id = ${barber.id} AND date = ${dateString}
                    `;
                    
                    if (existingSchedule.length === 0) {
                        // Create new schedule for this date
                        await sql`
                            INSERT INTO barber_schedules (barber_id, date, available_slots, unavailable_slots, day_off)
                            VALUES (${barber.id}, ${dateString}, ${JSON.stringify(slotsForDay)}, ${JSON.stringify([])}, ${isDayOff || isRecurringClosed})
                        `;
                        addedCount++;
                    } else {
                        // ✅ FIX: NON sovrascrivere schedule eccezionali (day_off=false su giorni normalmente chiusi)
                        // Se lo schedule esistente ha day_off=false su un giorno con chiusura ricorrente,
                        // è un'apertura eccezionale e NON deve essere sovrascritto dal daily update
                        const currentSchedule = existingSchedule[0];
                        const isExceptionalOpening = !currentSchedule.day_off && isRecurringClosed;
                        
                        if (isExceptionalOpening) {
                            // Skip exceptional openings - they are manually managed
                            skippedExceptionalCount++;
                            console.log(`⚠️ Skipping exceptional opening for ${barber.email} on ${dateString}`);
                        } else {
                            // Update existing schedule with correct slots
                            await sql`
                                UPDATE barber_schedules 
                                SET available_slots = ${JSON.stringify(slotsForDay)},
                                    day_off = ${isDayOff || isRecurringClosed}
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
                sundaysSkipped: skippedSundaysCount,
                exceptionalOpeningsPreserved: skippedExceptionalCount,
                protectedDatesSkipped: skippedProtectedCount,
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
