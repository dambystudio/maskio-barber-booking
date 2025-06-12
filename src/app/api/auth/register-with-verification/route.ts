import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../lib/database';
import { EmailVerificationService } from '../../../../lib/email-verification';
import bcrypt from 'bcryptjs';

// Temporary storage for pending registrations (in production use Redis)
const pendingRegistrations = new Map<string, {
  name: string;
  email: string;
  phone: string;
  password: string;
  verificationCode: string;
  expiresAt: Date;
}>();

// STEP 1: Validate data and send verification email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, step, verificationCode } = body;

    if (step === 'send-verification') {
      // STEP 1: Validate and send verification email
      
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
      }

      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store pending registration
      const registrationKey = email.toLowerCase();
      pendingRegistrations.set(registrationKey, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password, // Will be hashed when completing registration
        verificationCode,
        expiresAt
      });

      // In development, log the code
      if (process.env.NODE_ENV === 'development') {
        console.log(`📧 CODICE VERIFICA REGISTRAZIONE per ${email}: ${verificationCode}`);
        console.log(`⏰ Scadenza: ${expiresAt.toLocaleTimeString('it-IT')}`);
      }

      // TODO: In production, send real email here
      /*
      const emailContent = `
        <h2>🎉 Benvenuto in Maskio Barber!</h2>
        <p>Per completare la registrazione, inserisci questo codice:</p>
        <div style="font-size: 24px; font-weight: bold; color: #f59e0b; text-align: center; padding: 20px; border: 2px solid #f59e0b; border-radius: 10px; margin: 20px 0;">
          ${verificationCode}
        </div>
        <p>⏰ Il codice scadrà tra <strong>15 minuti</strong>.</p>
      `;
      */

      return NextResponse.json({
        message: 'Codice di verifica inviato via email',
        success: true,
        devCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
      });    } else if (step === 'verify-and-register') {
      // STEP 2: Verify code and complete registration

      if (!email || !verificationCode) {
        return NextResponse.json(
          { error: 'Email e codice di verifica richiesti' },
          { status: 400 }
        );
      }

      const registrationKey = email.toLowerCase();
      const pendingReg = pendingRegistrations.get(registrationKey);

      if (!pendingReg) {
        return NextResponse.json(
          { error: 'Nessuna registrazione in corso per questa email' },
          { status: 400 }
        );
      }

      if (pendingReg.expiresAt < new Date()) {
        pendingRegistrations.delete(registrationKey);
        return NextResponse.json(
          { error: 'Il codice di verifica è scaduto. Riprova la registrazione.' },
          { status: 400 }
        );
      }

      if (pendingReg.verificationCode !== verificationCode) {
        return NextResponse.json(
          { error: 'Codice di verifica non valido' },
          { status: 400 }
        );
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(pendingReg.password, 12);

      const newUser = await DatabaseService.createUser({
        name: pendingReg.name,
        email: pendingReg.email,
        phone: pendingReg.phone,
        role: 'customer',
        password: hashedPassword,
        emailVerified: new Date() // Email is verified since they used the code
      });

      // Clean up pending registration
      pendingRegistrations.delete(registrationKey);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;

      return NextResponse.json({
        message: 'Registrazione completata con successo! Email verificata.',
        user: userWithoutPassword,
        emailVerified: true
      });
    }

    return NextResponse.json(
      { error: 'Step non valido' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
