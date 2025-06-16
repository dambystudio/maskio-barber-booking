import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database-postgres';
import { users, bookings, accounts, sessions, barbers } from '@/lib/schema';
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

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    // Solo admin possono eliminare utenti
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Solo gli admin possono eliminare utenti' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId è richiesto' }, { status: 400 });
    }

    // Controlla che l'utente non stia cercando di eliminare se stesso
    if (session.user.id === userId) {
      return NextResponse.json({ error: 'Non puoi eliminare il tuo stesso account' }, { status: 400 });
    }

    // Prima ottieni i dettagli dell'utente da eliminare
    const userToDelete = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userToDelete.length === 0) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }

    const user = userToDelete[0];    // Elimina prima i record dipendenti per evitare errori di foreign key
    // 1. Elimina le prenotazioni dell'utente
    await db.delete(bookings).where(eq(bookings.userId, userId));

    // 2. Elimina gli account OAuth collegati
    await db.delete(accounts).where(eq(accounts.userId, userId));

    // 3. Elimina le sessioni
    await db.delete(sessions).where(eq(sessions.userId, userId));

    // 4. Se è un barbiere, elimina anche le informazioni del barbiere
    if (user.role === 'barber') {
      await db.delete(barbers).where(eq(barbers.userId, userId));
    }

    // 5. Infine elimina l'utente
    const result = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      });

    if (result.length === 0) {
      return NextResponse.json({ error: 'Errore durante l\'eliminazione' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `Account eliminato con successo: ${result[0].name} (${result[0].email})`,
      deletedUser: result[0]
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Errore del server durante l\'eliminazione' }, { status: 500 });
  }
}
