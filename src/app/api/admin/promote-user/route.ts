import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { db } from '@/lib/database-postgres';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Solo admin possono promuovere utenti
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accesso negato. Solo admin possono promuovere utenti.' },
        { status: 403 }
      );
    }

    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email e ruolo sono obbligatori' },
        { status: 400 }
      );
    }

    if (!['admin', 'barber', 'user'].includes(role)) {
      return NextResponse.json(
        { error: 'Ruolo non valido. Usare: admin, barber, o user' },
        { status: 400 }
      );
    }

    // Cerca l'utente
    const userList = await db.select().from(users).where(eq(users.email, email));
    
    if (userList.length === 0) {
      return NextResponse.json(
        { error: `Nessun utente trovato con email: ${email}` },
        { status: 404 }
      );
    }

    const user = userList[0];
    const oldRole = user.role || 'user';    // Aggiorna il ruolo
    const result = await db
      .update(users)
      .set({ 
        role: role
      })
      .where(eq(users.email, email))
      .returning();

    if (result.length > 0) {
      return NextResponse.json({
        success: true,
        user: {
          id: result[0].id,
          name: result[0].name,
          email: result[0].email,
          oldRole,
          newRole: result[0].role
        },
        message: `Utente ${result[0].name} promosso da ${oldRole} a ${result[0].role}`,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { error: 'Errore nell\'aggiornamento del ruolo' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error promoting user:', error);
    return NextResponse.json(
      { error: 'Errore interno del server durante la promozione' },
      { status: 500 }
    );
  }
}
