import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { db } from '@/lib/database-postgres';
import { eq, and } from 'drizzle-orm';
import { barberClosures, barberRemovedAutoClosures } from '@/lib/schema';
import { getBarberClosures } from '@/lib/barber-closures';

// Funzione per salvare una nuova chiusura
async function saveBarberClosure(closure: {
  barberEmail: string;
  closureDate: string;
  closureType: 'full' | 'morning' | 'afternoon';
  reason?: string;
  createdBy: string;
}) {
  try {
    const result = await db.insert(barberClosures).values({
      barberEmail: closure.barberEmail,
      closureDate: closure.closureDate,
      closureType: closure.closureType,
      reason: closure.reason || null,
      createdBy: closure.createdBy,
    }).returning();
    
    console.log('💾 Saved barber closure:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error saving barber closure:', error);
    throw error;
  }
}

// Funzione per rimuovere una chiusura
async function removeBarberClosure(
  barberEmail: string, 
  closureDate: string, 
  closureType: string,
  removedBy: string
) {
  try {
    // 1. Prima ottieni i dati della chiusura (per sapere se è automatica)
    const closureToDelete = await db.select()
      .from(barberClosures)
      .where(and(
        eq(barberClosures.barberEmail, barberEmail),
        eq(barberClosures.closureDate, closureDate),
        eq(barberClosures.closureType, closureType)
      ))
      .limit(1);
    
    if (closureToDelete.length === 0) {
      console.log('⚠️ Closure not found for deletion');
      return false;
    }

    const closure = closureToDelete[0];
    const isAutomaticClosure = closure.createdBy === 'system-auto' || closure.createdBy === 'system';
    
    // 2. Elimina la chiusura
    const result = await db.delete(barberClosures)
      .where(and(
        eq(barberClosures.barberEmail, barberEmail),
        eq(barberClosures.closureDate, closureDate),
        eq(barberClosures.closureType, closureType)
      ))
      .returning();
    
    console.log('🗑️ Removed barber closure:', result);
    
    // 3. ✨ NUOVO: Se era una chiusura automatica, registra la rimozione
    // In questo modo il daily-update NON la ricreerà
    if (isAutomaticClosure && result.length > 0) {
      try {
        await db.insert(barberRemovedAutoClosures).values({
          barberEmail: barberEmail,
          closureDate: closureDate,
          closureType: closureType as 'full' | 'morning' | 'afternoon',
          removedBy: removedBy,
          reason: 'Rimossa dal barbiere per apertura eccezionale',
        });
        
        console.log('✅ Registered automatic closure removal (will not be recreated by daily-update)');
      } catch (insertError: any) {
        // Se già esiste un record (ON CONFLICT), ignora l'errore
        if (insertError?.message?.includes('duplicate key') || insertError?.message?.includes('unique')) {
          console.log('ℹ️ Removal already registered');
        } else {
          console.error('⚠️ Error registering removal:', insertError);
          // Non bloccare l'operazione anche se la registrazione fallisce
        }
      }
    }
    
    return result.length > 0;
  } catch (error) {
    console.error('Error removing barber closure:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const barberEmail = searchParams.get('barberEmail');
    const date = searchParams.get('date');
    
    const closures = await getBarberClosures(barberEmail || undefined, date || undefined);
    return NextResponse.json({ success: true, closures });
  } catch (error) {
    console.error('Error fetching barber closures:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barberEmail, closureDate, closureType, reason } = await request.json();
    
    // Validazione dei dati
    if (!barberEmail || !closureDate || !closureType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['full', 'morning', 'afternoon'].includes(closureType)) {
      return NextResponse.json({ error: 'Invalid closure type' }, { status: 400 });
    }

    // Validazione del formato data
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(closureDate)) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    const closure = await saveBarberClosure({
      barberEmail,
      closureDate,
      closureType,
      reason,
      createdBy: session.user.email,
    });

    return NextResponse.json({ 
      success: true, 
      closure 
    });  } catch (error: any) {
    console.error('Error creating barber closure:', error);
    
    // Gestione errore di constraint unique
    if (error?.message?.includes('duplicate key') || error?.message?.includes('unique')) {
      return NextResponse.json({ 
        error: 'Closure already exists for this barber, date and type' 
      }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barberEmail, closureDate, closureType } = await request.json();
    
    // Validazione dei dati
    if (!barberEmail || !closureDate || !closureType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const removed = await removeBarberClosure(
      barberEmail, 
      closureDate, 
      closureType,
      session.user.email // ✨ Pass removedBy parameter
    );
    
    if (!removed) {
      return NextResponse.json({ error: 'Closure not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Closure removed successfully' 
    });
  } catch (error) {
    console.error('Error removing barber closure:', error);    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
