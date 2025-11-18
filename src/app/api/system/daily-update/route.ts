// API endpoint for daily system updates - Maskio Barber
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { 
  getUniversalSlots, 
  getAutoClosureType, 
  getAutoClosureReason,
  type DayOfWeek 
} from '@/lib/universal-slots';

const sql = neon(process.env.DATABASE_URL!);

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

/**
 * Create automatic closure for a barber if it doesn't already exist
 * Returns true if closure was created, false if it already existed or wasn't needed
 */
/**
 * Crea una chiusura automatica se necessaria per il barbiere e il giorno specificato.
 * ✅ NON ricrea la chiusura se è stata rimossa manualmente dal barbiere.
 * Ritorna true se ha creato una nuova chiusura, false altrimenti.
 */
async function createAutoClosureIfNeeded(
    barberEmail: string,
    dateString: string,
    dayOfWeek: DayOfWeek
): Promise<boolean> {
    const closureType = getAutoClosureType(barberEmail, dayOfWeek);
    
    if (!closureType) {
        return false; // No automatic closure needed
    }
    
    // Check if closure already exists
    const existing = await sql`
        SELECT id FROM barber_closures
        WHERE barber_email = ${barberEmail}
        AND closure_date = ${dateString}
        AND closure_type = ${closureType}
    `;
    
    if (existing.length > 0) {
        return false; // Closure already exists
    }
    
    // ✅ NUOVO: Verifica se il barbiere ha rimosso intenzionalmente questa chiusura
    // Se sì, rispetta la scelta del barbiere e NON ricreare la chiusura
    const wasManuallyRemoved = await sql`
        SELECT id FROM barber_removed_auto_closures
        WHERE barber_email = ${barberEmail}
        AND closure_date = ${dateString}
        AND closure_type = ${closureType}
    `;
    
    if (wasManuallyRemoved.length > 0) {
        console.log(`ℹ️ Skipping auto-closure (was manually removed): ${barberEmail} on ${dateString}`);
        return false; // Rispetta la rimozione manuale, NON ricreare
    }
    
    // Create the automatic closure
    const reason = getAutoClosureReason(barberEmail, closureType);
    
    await sql`
        INSERT INTO barber_closures (
            barber_email,
            closure_date,
            closure_type,
            reason,
            created_by,
            created_at,
            updated_at
        ) VALUES (
            ${barberEmail},
            ${dateString},
            ${closureType},
            ${reason},
            'system-auto',
            NOW(),
            NOW()
        )
    `;
    
    console.log(`✅ Created automatic ${closureType} closure for ${barberEmail} on ${dateString}`);
    return true;
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
        let autoClosuresCreated = 0;
        
        for (let i = 0; i < 60; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            const dayOfWeek = date.getDay() as DayOfWeek;
            
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
                    // ✅ NEW: Get universal slots for this day (same for all barbers)
                    const slotsForDay = getUniversalSlots(dayOfWeek);
                    const isDayOff = slotsForDay.length === 0;
                    
                    // Check if barber has recurring closure for this day
                    const isRecurringClosed = await isBarberClosedOnDay(barber.email, dayOfWeek);
                    
                    // Check if schedule already exists
                    const existingSchedule = await sql`
                        SELECT id, available_slots FROM barber_schedules 
                        WHERE barber_id = ${barber.id} AND date = ${dateString}
                    `;
                    
                    // ✅ CRITICAL: Always check for automatic closures (not just on new schedules)
                    // This ensures closures are created even when updating existing schedules
                    const closureCreated = await createAutoClosureIfNeeded(barber.email, dateString, dayOfWeek);
                    if (closureCreated) {
                        autoClosuresCreated++;
                    }
                    
                    if (existingSchedule.length === 0) {
                        // Create new schedule for this date with UNIVERSAL slots
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
                autoClosuresCreated: autoClosuresCreated,
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
            system: 'Daily Update System - Universal Slots',
            status: 'active',
            currentSchedules: parseInt(scheduleCount[0].total),
            activeBarbers: parseInt(barberCount[0].total),
            slotConfiguration: {
                monday: '09:00-12:30 + 15:00-18:00 (15 slots)',
                tuesdayToFriday: '09:00-12:30 + 15:00-17:30 (14 slots)',
                saturday: '09:00-12:30 + 14:30-17:00 (14 slots)',
                sunday: 'CLOSED'
            },
            automaticClosures: {
                michele: 'Monday morning',
                fabio: 'Monday full day',
                nicolo: 'Every day morning'
            },
            lastCheck: new Date().toISOString()
        });
        
    } catch (error) {
        return NextResponse.json({
            error: 'Failed to get system status',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
