import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/database';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, password } = await request.json();

    // Validation dei campi obbligatori
    if (!firstName || firstName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Il nome deve essere di almeno 2 caratteri' },
        { status: 400 }
      );
    }

    if (!lastName || lastName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Il cognome deve essere di almeno 2 caratteri' },
        { status: 400 }
      );
    }

    if (!email || email.trim().length === 0) {
      return NextResponse.json(
        { error: 'L\'email è obbligatoria' },
        { status: 400 }
      );
    }

    if (!phone || phone.trim().length === 0) {
      return NextResponse.json(
        { error: 'Il numero di telefono è obbligatorio' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'La password deve essere di almeno 6 caratteri' },
        { status: 400 }
      );
    }

    // Validation formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato email non valido' },
        { status: 400 }
      );
    }    // Validation formato telefono - solo numeri italiani (+39)
    const phoneRegex = /^(\+39|0039|39)?[\s]?3[0-9]{2}[\s]?[0-9]{3}[\s]?[0-9]{3,4}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Inserisci un numero di cellulare italiano valido (es. +39 333 123 4567)' },
        { status: 400 }
      );
    }

    // NOTA: Verifica telefono rimossa - Il telefono è obbligatorio ma non serve verifica SMS// Normalizza il numero di telefono per assicurarsi che abbia il prefisso +39
    const normalizePhoneNumber = (phone: string) => {
      const cleaned = phone.replace(/\s/g, '');
      if (cleaned.startsWith('39') && !cleaned.startsWith('+39')) {
        return '+' + cleaned;
      }
      if (cleaned.startsWith('0039')) {
        return '+' + cleaned.substring(2);
      }
      if (!cleaned.startsWith('+39')) {
        return '+39' + cleaned;
      }
      return cleaned;
    };

    const normalizedPhone = normalizePhoneNumber(phone.trim());

    // Check if email already exists
    const existingUserByEmail = await DatabaseService.getUserByEmail(email.trim().toLowerCase());
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Un utente con questa email esiste già' },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const existingUserByPhone = await DatabaseService.getUserByPhone(normalizedPhone);
    if (existingUserByPhone) {
      return NextResponse.json(
        { error: 'Un utente con questo numero di telefono esiste già' },
        { status: 400 }
      );
    }// Hash password
    const hashedPassword = await bcrypt.hash(password, 12);    // Create user with normalized data
    const newUser = await DatabaseService.createUser({
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim().toLowerCase(),
      phone: normalizedPhone,
      role: 'customer',
      password: hashedPassword,
      emailVerified: new Date(), // Segna come verificato automaticamente
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      message: 'Utente registrato con successo',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
