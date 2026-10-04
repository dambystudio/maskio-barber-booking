import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { isDateClosed } from '@/lib/closure-utils';
import { getBarberRecurringClosures, getBarberClosures } from '@/lib/barber-closures';
import { getScheduleTimeSlots, isManualExceptionalSchedule } from '@/lib/barber-schedule-exceptions';
import { filterSlotsByMondayBookingCutoff } from '@/lib/universal-slots';

interface BatchAvailabilityRequest {
  barberId: string;
  dates: string[];
}

interface DayAvailability {
  hasSlots: boolean;
  availableCount: number;
  totalSlots: number;
}

interface BatchAvailabilityResponse {
  availability: Record<string, DayAvailability>;
  exceptionalOpenings?: string[]; // Aperture eccezionali che sovrascrivono chiusure ricorrenti
}

// Cache per una singola richiesta batch per evitare query ripetitivee
interface RequestCache {
  closureSettings?: any;
  barberRecurringClosures?: any[];
  barberSpecificClosures?: Map<string, any[]>; // chiusure specifiche per data
  closedDatesCache: Map<string, boolean>;
  barberClosedCache: Map<string, boolean>;
}

export async function POST(request: NextRequest) {
  try {
    const { barberId, dates }: BatchAvailabilityRequest = await request.json();

    if (!barberId || !dates || !Array.isArray(dates)) {
      return NextResponse.json(
        { error: 'barberId and dates array are required' },
        { status: 400 }
      );
    }

    if (dates.length > 60) {
      return NextResponse.json(
        { error: 'Maximum 60 dates allowed per request' },
        { status: 400 }
      );
    }    console.log(`📊 Batch availability check for barber ${barberId} - ${dates.length} dates`);

    // Get barber email for closure checks
    const barberData = await DatabaseService.getBarberById(barberId);
    const barberEmail = barberData?.email;

    // Inizializza cache per questa richiesta e carica tutte le impostazioni una sola volta
    const requestCache: RequestCache = {
      closedDatesCache: new Map(),
      barberClosedCache: new Map(),
      barberSpecificClosures: new Map()
    };

    // Carica le impostazioni di chiusura generale una sola volta
    console.log('🔄 Loading general closure settings...');
          const { getClosureSettings } = await import('@/lib/closure-utils');
      requestCache.closureSettings = await getClosureSettings();
    console.log('✅ Loaded general closure settings:', requestCache.closureSettings);

    // Carica le chiusure ricorrenti del barbiere una sola volta
    if (barberEmail) {
      console.log(`🔄 Loading barber closures for ${barberEmail}...`);
      requestCache.barberRecurringClosures = await getBarberRecurringClosures(barberEmail);
      console.log(`✅ Loaded ${requestCache.barberRecurringClosures.length} recurring closures`);
    }

    const availability: Record<string, DayAvailability> = {};
    const exceptionalOpenings: string[] = []; // Track exceptional openings

    for (const date of dates) {
      try {
        // ✅ PRIMA: Controlla se esiste schedule specifico per questo barbiere/data
        const schedule = await DatabaseService.getBarberSchedule(barberId, date);

        // Debug log for Oct 30
        if (date === '2025-10-30') {
          console.log(`🔍 [Oct 30] Schedule found:`, {
            hasSchedule: !!schedule,
            dayOff: schedule?.dayOff,
            hasAvailableSlots: !!schedule?.availableSlots
          });
        }

        const isRecurringClosed = barberEmail ? isBarberClosedRecurringCached(date, requestCache) : false;
        const isManualExceptionalOpening = !!schedule && !schedule.dayOff && isRecurringClosed && isManualExceptionalSchedule(schedule);

        // Prima rispetta le chiusure generali del salone: non sono sovrascritte
        // dagli schedule del singolo barbiere.
        const dateIsClosed = await isDateClosedCached(date, requestCache);
        if (dateIsClosed) {
          availability[date] = {
            hasSlots: false,
            availableCount: 0,
            totalSlots: 0
          };
          continue;
        }

        // Le chiusure ricorrenti del barbiere devono chiudere la data anche se esiste
        // uno schedule generato automaticamente con day_off=false. Solo un'apertura
        // eccezionale manuale può sovrascriverle.
        if (isRecurringClosed && !isManualExceptionalOpening) {
          availability[date] = {
            hasSlots: false,
            availableCount: 0,
            totalSlots: 0
          };
          continue;
        }

        // Se c'è uno schedule con day_off=false, usa gli slot configurati per quel giorno.
        // Se la data era ricorrentemente chiusa, arriva qui solo se è un'apertura eccezionale manuale.
        if (schedule && !schedule.dayOff && schedule.availableSlots) {
          const allTimeSlots = filterSlotsByMondayBookingCutoff(
            date, getScheduleTimeSlots(schedule.availableSlots, schedule.unavailableSlots)
          );

          if (date === '2025-10-30') {
            console.log(`🔍 [Oct 30] Parsed slots:`, {
              allTimeSlots: allTimeSlots.length,
              willEnterBlock: allTimeSlots.length > 0,
              isManualExceptionalOpening
            });
          }

          if (allTimeSlots.length > 0) {
            // Get available slots
            const availableSlotTimes = await DatabaseService.getAvailableSlots(barberId, date);

            let finalAvailableSlots = availableSlotTimes;
            if (barberEmail) {
              finalAvailableSlots = [];

              if (isManualExceptionalOpening) {
                // Per aperture eccezionali manuali, controlla SOLO le chiusure specifiche per orario
                // (la chiusura ricorrente è già stata sovrascritta manualmente).
                if (!requestCache.barberSpecificClosures!.has(date)) {
                  const originalConsoleLog = console.log;
                  console.log = () => {}; // Disabilita temporaneamente i log
                  const specificClosures = await getBarberClosures(barberEmail, date);
                  console.log = originalConsoleLog; // Ripristina i log
                  requestCache.barberSpecificClosures!.set(date, specificClosures);
                }

                const specificClosures = requestCache.barberSpecificClosures!.get(date) || [];

                for (const time of availableSlotTimes) {
                  let isClosedSpecific = false;

                  if (specificClosures.length > 0) {
                    const hour = parseInt(time.split(':')[0]);
                    const isMorning = hour < 14;

                    isClosedSpecific = specificClosures.some(closure => {
                      if (closure.closureType === 'full') return true;
                      if (closure.closureType === 'morning' && isMorning) return true;
                      if (closure.closureType === 'afternoon' && !isMorning) return true;
                      return false;
                    });
                  }

                  if (!isClosedSpecific) {
                    finalAvailableSlots.push(time);
                  }
                }
              } else {
                // Giorno normale con schedule: applica sia chiusure specifiche sia eventuali ricorrenti.
                for (const time of availableSlotTimes) {
                  const barberIsClosed = await isBarberClosedCached(barberEmail, date, time, requestCache);
                  if (!barberIsClosed) {
                    finalAvailableSlots.push(time);
                  }
                }
              }
            }

            availability[date] = {
              hasSlots: finalAvailableSlots.length > 0,
              availableCount: finalAvailableSlots.length,
              totalSlots: allTimeSlots.length
            };

            if (isManualExceptionalOpening) {
              exceptionalOpenings.push(date);
            }

            if (date === '2025-10-30' && isManualExceptionalOpening) {
              console.log(`🎯 [Oct 30] MARKED AS EXCEPTIONAL OPENING!`);
              console.log(`   exceptionalOpenings array now:`, exceptionalOpenings);
            }

            console.log(`✅ ${date}: ${isManualExceptionalOpening ? 'Apertura eccezionale' : 'Disponibilità'} - ${finalAvailableSlots.length}/${allTimeSlots.length} slot disponibili`);
            continue;
          }
        }

        // Generate all possible time slots for the day
        // IMPORTANT: Use schedule from database if available, as it may have custom hours
        let allTimeSlots: string[] = [];

        if (schedule && !schedule.dayOff && schedule.availableSlots) {
          // Use slots from database (custom schedule for this specific day)
          allTimeSlots = getScheduleTimeSlots(schedule.availableSlots, schedule.unavailableSlots);
        } else {
          // No specific schedule, use standard generated slots
          allTimeSlots = await generateAllTimeSlots(date, requestCache);
        }

        allTimeSlots = filterSlotsByMondayBookingCutoff(date, allTimeSlots);
        const totalSlots = allTimeSlots.length;

        if (totalSlots === 0) {
          availability[date] = {
            hasSlots: false,
            availableCount: 0,
            totalSlots: 0
          };
          continue;
        }

        // Get available slots from database
        const availableSlotTimes = await DatabaseService.getAvailableSlots(barberId, date);

        // Filter out slots where barber is closed (with cache)
        let finalAvailableSlots = availableSlotTimes;

        if (barberEmail) {
          finalAvailableSlots = [];
          for (const time of availableSlotTimes) {
            const barberIsClosed = await isBarberClosedCached(barberEmail, date, time, requestCache);
            if (!barberIsClosed) {
              finalAvailableSlots.push(time);
            }
          }
        }

        availability[date] = {
          hasSlots: finalAvailableSlots.length > 0,
          availableCount: finalAvailableSlots.length,
          totalSlots
        };

      } catch (error) {
        console.error(`Error checking availability for ${date}:`, error);
        availability[date] = {
          hasSlots: false,
          availableCount: 0,
          totalSlots: 0
        };
      }
    }

    console.log(`✅ Batch availability completed - processed ${dates.length} dates`);
    console.log(`📊 Exceptional openings found: ${exceptionalOpenings.length}`, exceptionalOpenings);

    return NextResponse.json({
      availability,
      exceptionalOpenings
    } as BatchAvailabilityResponse, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Error in batch availability check:', error);
    return NextResponse.json(
      { error: 'Failed to check batch availability' },
      { status: 500 }
    );
  }
}

async function generateAllTimeSlots(dateString: string, requestCache?: RequestCache): Promise<string[]> {
  const slots: string[] = [];
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();

  if (dateString === '2026-04-11') {
    for (let hour = 9; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 12 && minute > 30) break;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    slots.push('13:00', '13:30', '14:00', '14:30');
    return slots;
  }

  // Check if the day is closed according to closure settings
  const dateIsClosed = requestCache
    ? await isDateClosedCached(dateString, requestCache)
    : await isDateClosed(dateString);

  if (dateIsClosed) {
    return slots; // Return empty array if day is closed
  }

  if (dateString === '2026-04-11') {
    for (let hour = 9; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 12 && minute > 30) break;
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    slots.push('13:00', '13:30', '14:00', '14:30');
    return slots;
  }

  // Saturday has same hours as weekdays (9:00-12:30, 15:00-17:30)
  if (dayOfWeek === 6) {
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
  } else if (dayOfWeek === 0) {
    // Sunday is closed
    return slots;
  } else if (dayOfWeek === 1) {
    // Monday (9:00-12:30, 15:00-17:00)
    // Morning slots 9:00-12:30
    for (let hour = 9; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 12 && minute > 30) break;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }

    // Afternoon slots 15:00-17:00 (ultimo appuntamento 17:00)
    for (let hour = 15; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 0) break;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
  } else {
    // Monday to Friday (9:00-12:30, 15:00-19:00)
    // Morning slots 9:00-12:30
    for (let hour = 9; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 12 && minute > 30) break;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }

    // Afternoon slots 15:00-19:00
    for (let hour = 15; hour <= 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
  }

  return slots;
}

// Funzioni cache per evitare query ripetitive durante una singola richiesta batch
async function isDateClosedCached(date: string, cache: RequestCache): Promise<boolean> {
  const cacheKey = `date_${date}`;

  if (cache.closedDatesCache.has(cacheKey)) {
    return cache.closedDatesCache.get(cacheKey)!;
  }

  // Usa le impostazioni dalla cache invece di rileggerle dal database
  if (!cache.closureSettings) {
    // Fallback nel caso la cache non sia stata inizializzata
    const isClosed = await isDateClosed(date);
    cache.closedDatesCache.set(cacheKey, isClosed);
    return isClosed;
  }

  const settings = cache.closureSettings;

  // Controlla se è una data specifica chiusa
  if (settings.closedDates.includes(date)) {
    cache.closedDatesCache.set(cacheKey, true);
    return true;
  }

  // Controlla se è un giorno della settimana chiuso
  const dateObj = new Date(date + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();
  const isClosed = settings.closedDays.includes(dayOfWeek);

  cache.closedDatesCache.set(cacheKey, isClosed);
  return isClosed;
}

function isBarberClosedRecurringCached(date: string, cache: RequestCache): boolean {
  if (!cache.barberRecurringClosures || cache.barberRecurringClosures.length === 0) {
    return false;
  }

  const parsedDate = new Date(date + 'T00:00:00');
  const dayOfWeek = parsedDate.getDay();

  return cache.barberRecurringClosures.some(closure => {
    try {
      const closedDays = JSON.parse(closure.closedDays);
      return Array.isArray(closedDays) && closedDays.includes(dayOfWeek);
    } catch (error) {
      console.error('Error parsing closed days:', error);
      return false;
    }
  });
}

async function isBarberClosedCached(barberEmail: string, date: string, time: string, cache: RequestCache): Promise<boolean> {
  const cacheKey = `barber_${barberEmail}_${date}_${time}`;

  if (cache.barberClosedCache.has(cacheKey)) {
    return cache.barberClosedCache.get(cacheKey)!;
  }

  let isClosed = false;

  try {
    // Prima controlla le chiusure ricorrenti (giorni della settimana) dalla cache
    if (cache.barberRecurringClosures && cache.barberRecurringClosures.length > 0) {
      const parsedDate = new Date(date + 'T00:00:00');
      const dayOfWeek = parsedDate.getDay();

      const isClosedRecurring = cache.barberRecurringClosures.some(closure => {
        try {
          const closedDays = JSON.parse(closure.closedDays);
          return closedDays.includes(dayOfWeek);
        } catch (error) {
          console.error('Error parsing closed days:', error);
          return false;
        }
      });

      if (isClosedRecurring) {
        isClosed = true;
      }
    }

    // Se non è chiuso per chiusure ricorrenti, controlla le chiusure specifiche per quella data
    if (!isClosed) {
      // Carica le chiusure specifiche per questa data (solo se non già in cache)
      if (!cache.barberSpecificClosures!.has(date)) {
        // Usa getBarberClosures ma silenzia i log per evitare spam
        const originalConsoleLog = console.log;
        console.log = () => {}; // Disabilita temporaneamente i log

        const specificClosures = await getBarberClosures(barberEmail, date);

        console.log = originalConsoleLog; // Ripristina i log

        cache.barberSpecificClosures!.set(date, specificClosures);
      }

      const specificClosures = cache.barberSpecificClosures!.get(date) || [];

      if (specificClosures.length > 0) {
        // Determina se l'orario è mattina o pomeriggio
        const hour = parseInt(time.split(':')[0]);
        const isMorning = hour < 14; // Prima delle 14:00 è mattina

        // Controlla se c'è una chiusura che copre questo orario
        isClosed = specificClosures.some(closure => {
          if (closure.closureType === 'full') return true;
          if (closure.closureType === 'morning' && isMorning) return true;
          if (closure.closureType === 'afternoon' && !isMorning) return true;
          return false;
        });
      }
    }
  } catch (error) {
    console.error('Error checking barber closure:', error);
    isClosed = false;
  }

  cache.barberClosedCache.set(cacheKey, isClosed);
  return isClosed;
}
