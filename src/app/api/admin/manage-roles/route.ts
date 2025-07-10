import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database-postgres';
import { authorizedRoles } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

// Gestione dinamica ruoli autorizzati
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || (session.user.role !== 'admin' && session.user.role !== 'barber')) {
      return NextResponse.json(
        { error: 'Accesso negato. Solo admin e barbieri possono visualizzare i ruoli.' },
        { status: 403 }
      );
    }

    // Get all authorized roles from database
    const authorizations = await db
      .select()
      .from(authorizedRoles)
      .where(eq(authorizedRoles.isActive, true))
      .orderBy(authorizedRoles.role, authorizedRoles.email);

    const groupedByRole = authorizations.reduce((acc, auth) => {
      if (!acc[auth.role]) acc[auth.role] = [];
      acc[auth.role].push({
        email: auth.email,
        reason: auth.reason,
        addedAt: auth.createdAt
      });
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      success: true,
      authorizations: groupedByRole,
      total: authorizations.length,
      fallbackToEnv: {
        adminEmails: process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [],
        barberEmails: process.env.BARBER_EMAILS?.split(',').map(e => e.trim()) || []
      }
    });

  } catch (error) {
    console.error('Error fetching authorized roles:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accesso negato. Solo admin possono aggiungere autorizzazioni.' },
        { status: 403 }
      );
    }

    const { email, role, reason } = await request.json();

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

    // Check if authorization already exists
    const existing = await db
      .select()
      .from(authorizedRoles)
      .where(and(
        eq(authorizedRoles.email, email),
        eq(authorizedRoles.isActive, true)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing authorization
      const updated = await db
        .update(authorizedRoles)
        .set({
          role,
          reason,
          updatedAt: new Date()
        })
        .where(eq(authorizedRoles.email, email))
        .returning();

      return NextResponse.json({
        success: true,
        action: 'updated',
        authorization: updated[0],
        message: `Autorizzazione aggiornata per ${email}: ${role}`
      });
    } else {
      // Create new authorization
      const newAuth = await db
        .insert(authorizedRoles)
        .values({
          email,
          role,
          reason: reason || `Autorizzato come ${role}`,
          addedBy: session.user.id,
          isActive: true
        })
        .returning();

      return NextResponse.json({
        success: true,
        action: 'created',
        authorization: newAuth[0],
        message: `Nuova autorizzazione creata per ${email}: ${role}`
      });
    }

  } catch (error) {
    console.error('Error managing authorized role:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
