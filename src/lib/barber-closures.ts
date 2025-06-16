import { db } from '@/lib/database-postgres';
import { eq, and } from 'drizzle-orm';
import { barberClosures, barberRecurringClosures } from '@/lib/schema';

// Funzione per leggere le chiusure ricorrenti di un barbiere
export async function getBarberRecurringClosures(barberEmail: string) {
  try {
    const result = await db.select()
      .from(barberRecurringClosures)
      .where(eq(barberRecurringClosures.barberEmail, barberEmail));
    
    console.log('📖 Loaded barber recurring closures:', result);
    return result;
  } catch (error) {
    console.error('Error reading barber recurring closures:', error);
    return [];
  }
}

// Funzione per controllare se un barbiere è chiuso in base alle chiusure ricorrenti
export async function isBarberClosedRecurring(barberEmail: string, dateString: string): Promise<boolean> {
  try {
    const recurringClosures = await getBarberRecurringClosures(barberEmail);
    
    if (recurringClosures.length === 0) {
      return false;
    }
    
    // Ottieni il giorno della settimana (0 = Domenica, 1 = Lunedì, ..., 6 = Sabato)
    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = date.getDay();
    
    // Controlla se il giorno è nelle chiusure ricorrenti
    return recurringClosures.some(closure => {
      try {
        const closedDays = JSON.parse(closure.closedDays);
        return closedDays.includes(dayOfWeek);
      } catch (error) {
        console.error('Error parsing closed days:', error);
        return false;
      }
    });
  } catch (error) {
    console.error('Error checking barber recurring closure:', error);
    return false;
  }
}

// Funzione per leggere le chiusure di un barbiere per una data specifica
export async function getBarberClosures(barberEmail?: string, date?: string) {
  try {
    const conditions = [];
    if (barberEmail) {
      conditions.push(eq(barberClosures.barberEmail, barberEmail));
    }
    if (date) {
      conditions.push(eq(barberClosures.closureDate, date));
    }
    
    const result = conditions.length > 0 
      ? await db.select().from(barberClosures).where(and(...conditions))
      : await db.select().from(barberClosures);
    
    console.log('📖 Loaded barber closures:', result);
    return result;
  } catch (error) {
    console.error('Error reading barber closures:', error);
    return [];
  }
}

// Funzione helper per controllare se un barbiere è chiuso in una data e fascia oraria specifica
export async function isBarberClosed(barberEmail: string, dateString: string, timeSlot?: string): Promise<boolean> {
  try {
    // Prima controlla le chiusure ricorrenti (giorni della settimana)
    const isClosedRecurring = await isBarberClosedRecurring(barberEmail, dateString);
    if (isClosedRecurring) {
      console.log(`Barber ${barberEmail} is closed on ${dateString} due to recurring closure`);
      return true;
    }
    
    // Poi controlla le chiusure specifiche per quella data
    const closures = await getBarberClosures(barberEmail, dateString);
    
    if (closures.length === 0) {
      return false;
    }
    
    // Se non è specificato un orario, controlla solo le chiusure complete
    if (!timeSlot) {
      return closures.some(closure => closure.closureType === 'full');
    }
    
    // Determina se l'orario è mattina o pomeriggio
    const hour = parseInt(timeSlot.split(':')[0]);
    const isMorning = hour < 14; // Prima delle 14:00 è mattina
    
    // Controlla se c'è una chiusura che copre questo orario
    return closures.some(closure => {
      if (closure.closureType === 'full') return true;
      if (closure.closureType === 'morning' && isMorning) return true;
      if (closure.closureType === 'afternoon' && !isMorning) return true;
      return false;
    });
  } catch (error) {
    console.error('Error checking barber closure:', error);
    return false;
  }
}
