import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { isDateClosed } from '@/lib/closure-utils';
import { getBarberRecurringClosures, getBarberClosures } from '@/lib/barber-closures';

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

// Cache per una singola richiesta batch per evitare query ripetitive
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
        
        // Se c'è uno schedule con day_off=false, il barbiere è APERTO (apertura eccezionale)
        if (schedule && !schedule.dayOff && schedule.availableSlots) {
          try {
            const availableFromSchedule = JSON.parse(schedule.availableSlots);
            const unavailableFromSchedule = schedule.unavailableSlots ? JSON.parse(schedule.unavailableSlots) : [];
            const allTimeSlots = [...new Set([...availableFromSchedule, ...unavailableFromSchedule])];
            
            if (allTimeSlots.length > 0) {
              // Get available slots
              const availableSlotTimes = await DatabaseService.getAvailableSlots(barberId, date);
              
              // ✅ FIX: Per aperture eccezionali, controlla SOLO le chiusure specifiche per orario
              // NON controllare le chiusure ricorrenti (sono già sovrascritte dallo schedule)
              let finalAvailableSlots = availableSlotTimes;
              if (barberEmail) {
                finalAvailableSlots = [];
                
                // Carica le chiusure specifiche per questa data (solo se non già in cache)
                if (!requestCache.barberSpecificClosures!.has(date)) {
                  const originalConsoleLog = console.log;
                  console.log = () => {}; // Disabilita temporaneamente i log
                  const specificClosures = await getBarberClosures(barberEmail, date);
                  console.log = originalConsoleLog; // Ripristina i log
                  requestCache.barberSpecificClosures!.set(date, specificClosures);
                }
                
                const specificClosures = requestCache.barberSpecificClosures!.get(date) || [];
                
                for (const time of availableSlotTimes) {
                  // Controlla SOLO le chiusure specifiche per orario, ignora quelle ricorrenti
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
              }
              
              availability[date] = {
                hasSlots: finalAvailableSlots.length > 0,
                availableCount: finalAvailableSlots.length,
                totalSlots: allTimeSlots.length
              };
              
              // ✅ Mark this date as exceptional opening (overrides recurring closures)
              exceptionalOpenings.push(date);
              
              console.log(`✅ ${date}: Apertura eccezionale - ${finalAvailableSlots.length}/${allTimeSlots.length} slot disponibili`);
              continue;
            }
          } catch (error) {
            console.error(`Error parsing exceptional schedule for ${date}:`, error);
          }
        }
        
        // Se schedule ha day_off=true o non esiste, controlla chiusure generali
        const dateIsClosed = await isDateClosedCached(date, requestCache);
        if (dateIsClosed) {
          availability[date] = {
            hasSlots: false,
            availableCount: 0,
            totalSlots: 0
          };
          continue;
        }

        // Generate all possible time slots for the day
        // IMPORTANT: Use schedule from database if available, as it may have custom hours
        let allTimeSlots: string[] = [];
        
        if (schedule && !schedule.dayOff && schedule.availableSlots) {
          // Use slots from database (custom schedule for this specific day)
          try {
            const availableFromSchedule = JSON.parse(schedule.availableSlots);
            const unavailableFromSchedule = schedule.unavailableSlots ? JSON.parse(schedule.unavailableSlots) : [];
            // All possible slots = available + unavailable
            allTimeSlots = [...new Set([...availableFromSchedule, ...unavailableFromSchedule])];
          } catch (error) {
            console.error(`Error parsing schedule for ${date}:`, error);
            // Fallback to generated standard slots
            allTimeSlots = await generateAllTimeSlots(date, requestCache);
          }
        } else {
          // No specific schedule, use standard generated slots
          allTimeSlots = await generateAllTimeSlots(date, requestCache);
        }
        
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
    } as BatchAvailabilityResponse);
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
  
  // Check if the day is closed according to closure settings
  const dateIsClosed = requestCache 
    ? await isDateClosedCached(dateString, requestCache)
    : await isDateClosed(dateString);
    
  if (dateIsClosed) {
    return slots; // Return empty array if day is closed
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
