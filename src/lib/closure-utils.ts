import { db } from '@/lib/database-postgres';
import { eq } from 'drizzle-orm';
import { closureSettings } from '@/lib/schema';

// Funzione per leggere le impostazioni dal database
async function readClosureSettings() {
  try {
    const result = await db.select().from(closureSettings).where(eq(closureSettings.id, 'shop_closures')).limit(1);
    
    if (result.length === 0) {
      // Se non esiste, crea le impostazioni di default
      const defaultSettings = {
        id: 'shop_closures',
        closedDays: '[0]', // Domenica chiusa
        closedDates: '[]',
        updatedAt: new Date(),
        updatedBy: null
      };
      
      await db.insert(closureSettings).values(defaultSettings);
      console.log('📝 Created default closure settings');
      
      return {
        closedDays: [0],
        closedDates: []
      };
    }
    
    const settings = result[0];
    const parsedSettings = {
      closedDays: JSON.parse(settings.closedDays),
      closedDates: JSON.parse(settings.closedDates)
    };
    
    console.log('📖 Loaded closure settings from database:', parsedSettings);
    return parsedSettings;
  } catch (error) {
    console.error('Error reading closure settings from database:', error);
    // Fallback alle impostazioni di default
    return {
      closedDays: [0],
      closedDates: []
    };
  }
}

// Funzione helper per controllare se una data è chiusa
export async function isDateClosed(dateString: string): Promise<boolean> {
  const settings = await readClosureSettings();
  
  // Controlla se è una data specifica chiusa
  if (settings.closedDates.includes(dateString)) {
    return true;
  }
  
  // Controlla se è un giorno della settimana chiuso
  const date = new Date(dateString + 'T00:00:00');
  const dayOfWeek = date.getDay();
  return settings.closedDays.includes(dayOfWeek);
}

// Funzione helper per ottenere le impostazioni correnti
export async function getClosureSettings() {
  return await readClosureSettings();
} 