import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/database-postgres';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

const authOptions = {
  session: {
    strategy: 'jwt' as const
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const { phone } = await request.json();

    if (!phone || phone.trim().length === 0) {
      return NextResponse.json(
        { error: 'Il numero di telefono è obbligatorio' },
        { status: 400 }
      );
    }

    // Validazione formato telefono
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Formato numero di telefono non valido (minimo 10 cifre)' },
        { status: 400 }
      );
    }

    // Verifica se il telefono esiste già
    const existingUserWithPhone = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.phone, phone.trim()))
      .limit(1);

    if (existingUserWithPhone.length > 0) {
      // Verifica se è lo stesso utente
      const currentUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, session.user.email))
        .limit(1);

      if (existingUserWithPhone[0].id !== currentUser[0]?.id) {
        return NextResponse.json(
          { error: 'Questo numero di telefono è già associato a un altro account' },
          { status: 400 }
        );
      }
    }

    // Aggiorna il telefono dell'utente
    await db
      .update(users)
      .set({
        phone: phone.trim(),
      })
      .where(eq(users.email, session.user.email));

    return NextResponse.json({
      success: true,
      message: 'Numero di telefono aggiornato con successo'
    });

  } catch (error) {
    console.error('Error updating phone:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
