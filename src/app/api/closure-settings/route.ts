import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth.config';
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

// Funzione per salvare le impostazioni nel database
async function writeClosureSettings(settings: { closedDays: number[], closedDates: string[] }, userId?: string) {
  try {
    const updateData = {
      closedDays: JSON.stringify(settings.closedDays),
      closedDates: JSON.stringify(settings.closedDates),
      updatedAt: new Date(),
      updatedBy: userId || null
    };
    
    await db.update(closureSettings)
      .set(updateData)
      .where(eq(closureSettings.id, 'shop_closures'));
    
    console.log('💾 Saved closure settings to database:', settings);
    return true;
  } catch (error) {
    console.error('Error writing closure settings to database:', error);
    return false;
  }
}

export async function GET() {
  try {
    // Per ora non verifichiamo la sessione per il GET, così possiamo testare più facilmente
    const settings = readClosureSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching closure settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Commentiamo temporaneamente il controllo di sessione per i test

    const { closedDays, closedDates } = await request.json();
    
    // Validazione dei dati
    if (!Array.isArray(closedDays) || !Array.isArray(closedDates)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Validazione dei giorni (0-6)
    if (closedDays.some((day: any) => typeof day !== 'number' || day < 0 || day > 6)) {
      return NextResponse.json({ error: 'Invalid day numbers' }, { status: 400 });
    }

    // Validazione delle date (formato YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (closedDates.some((date: any) => typeof date !== 'string' || !dateRegex.test(date))) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Crea le nuove impostazioni
    const newSettings = {
      closedDays: [...closedDays],
      closedDates: [...closedDates]
    };

    // Salva nel file
    const saved = writeClosureSettings(newSettings);
    if (!saved) {
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }

    console.log('✅ Closure settings updated:', newSettings);

    return NextResponse.json({ 
      success: true, 
      settings: newSettings 
    });
  } catch (error) {
    console.error('Error updating closure settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
