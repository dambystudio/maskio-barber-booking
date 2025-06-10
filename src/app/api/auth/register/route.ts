import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/database';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();

    // Validation dei campi obbligatori
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Il nome deve essere di almeno 2 caratteri' },
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
    }

    // Validation formato telefono (almeno 10 cifre)
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Formato numero di telefono non valido (minimo 10 cifre)' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUserByEmail = await DatabaseService.getUserByEmail(email.trim().toLowerCase());
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Un utente con questa email esiste già' },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const existingUserByPhone = await DatabaseService.getUserByPhone(phone.trim());
    if (existingUserByPhone) {
      return NextResponse.json(
        { error: 'Un utente con questo numero di telefono esiste già' },
        { status: 400 }
      );
    }    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with normalized data
    const newUser = await DatabaseService.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: 'customer',
      password: hashedPassword
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
