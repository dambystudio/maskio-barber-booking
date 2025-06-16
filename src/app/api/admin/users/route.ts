import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { db } from '@/lib/database-postgres';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }    // Solo admin possono vedere la lista utenti
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Solo gli admin possono accedere a questa funzione' }, { status: 403 });
    }

    // Recupera tutti gli utenti
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
      })
      .from(users)
      .orderBy(users.createdAt);

    return NextResponse.json({ 
      users: allUsers.map(user => ({
        ...user,
        createdAt: user.createdAt?.toISOString(),
        lastLogin: user.lastLogin?.toISOString(),
      }))
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    // Solo admin possono modificare i ruoli
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Solo gli admin possono modificare i ruoli' }, { status: 403 });
    }

    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ error: 'userId e role sono richiesti' }, { status: 400 });
    }

    if (!['customer', 'barber', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Ruolo non valido' }, { status: 400 });
    }

    // Aggiorna il ruolo dell'utente
    const result = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      });

    if (result.length === 0) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Ruolo aggiornato con successo', 
      user: result[0] 
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 });
  }
}
