import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database-postgres';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    // Get user ID from database using email
    const dbUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!dbUser[0]) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }    const { name, phone } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Il nome è obbligatorio' },
        { status: 400 }
      );
    }

    // Validazione telefono se presente
    if (phone && phone.trim()) {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        return NextResponse.json(
          { error: 'Formato numero di telefono non valido (minimo 10 cifre)' },
          { status: 400 }
        );
      }

      // Verifica se il telefono esiste già per un altro utente
      const existingUserWithPhone = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.phone, phone.trim()))
        .limit(1);

      if (existingUserWithPhone.length > 0 && existingUserWithPhone[0].id !== dbUser[0].id) {
        return NextResponse.json(
          { error: 'Questo numero di telefono è già associato a un altro account' },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const updateData: any = {
      name: name.trim(),
    };

    if (phone !== undefined) {
      updateData.phone = phone.trim() || null;
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, dbUser[0].id));

    return NextResponse.json({
      success: true,
      message: 'Profilo aggiornato con successo'
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    // Get user profile
    const userProfile = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        image: users.image,
        role: users.role,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
      })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (userProfile.length === 0) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: userProfile[0]
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
