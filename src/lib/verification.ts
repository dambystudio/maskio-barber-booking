// Email and Phone Verification System
import crypto from 'crypto';
import { db } from './database-postgres';
import { users } from './schema';
import { eq } from 'drizzle-orm';

interface VerificationCode {
  userId: string;
  email?: string;
  phone?: string;
  code: string;
  type: 'email' | 'phone';
  expiresAt: Date;
  verified: boolean;
}

// In-memory storage for demo (in production use Redis or database table)
const verificationCodes = new Map<string, VerificationCode>();

export class VerificationService {
  
  // Generate 6-digit verification code
  static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send email verification
  static async sendEmailVerification(userId: string, email: string): Promise<boolean> {
    try {
      const code = this.generateCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      // Store verification code
      verificationCodes.set(`email_${userId}`, {
        userId,
        email,
        code,
        type: 'email',
        expiresAt,
        verified: false
      });

      // Send email using your existing email service
      const emailContent = `
        <h2>Verifica il tuo indirizzo email</h2>
        <p>Il tuo codice di verifica è: <strong>${code}</strong></p>
        <p>Il codice scadrà tra 15 minuti.</p>
        <p>Se non hai richiesto questa verifica, ignora questa email.</p>
      `;

      // TODO: Integrate with your email service (Resend/Gmail SMTP)
      console.log(`Email verification code for ${email}: ${code}`);
      
      return true;
    } catch (error) {
      console.error('Error sending email verification:', error);
      return false;
    }
  }

  // Send SMS verification (requires paid service)
  static async sendSMSVerification(userId: string, phone: string): Promise<boolean> {
    try {
      const code = this.generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Store verification code
      verificationCodes.set(`phone_${userId}`, {
        userId,
        phone,
        code,
        type: 'phone',
        expiresAt,
        verified: false
      });

      // TODO: Integrate with SMS service (Twilio/AWS SNS)
      console.log(`SMS verification code for ${phone}: ${code}`);
      
      return true;
    } catch (error) {
      console.error('Error sending SMS verification:', error);
      return false;
    }
  }

  // Verify email code
  static async verifyEmailCode(userId: string, inputCode: string): Promise<boolean> {
    const verification = verificationCodes.get(`email_${userId}`);
    
    if (!verification || verification.type !== 'email') {
      return false;
    }

    if (verification.expiresAt < new Date()) {
      verificationCodes.delete(`email_${userId}`);
      return false;
    }

    if (verification.code !== inputCode) {
      return false;
    }

    // Mark as verified and update user in database
    verification.verified = true;
    
    try {
      await db
        .update(users)
        .set({ emailVerified: new Date() })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('Error updating email verification in database:', error);
    }

    verificationCodes.delete(`email_${userId}`);
    return true;
  }
  // Verify phone code
  static async verifyPhoneCode(userId: string, inputCode: string): Promise<boolean> {
    const verification = verificationCodes.get(`phone_${userId}`);
    
    if (!verification || verification.type !== 'phone') {
      return false;
    }

    if (verification.expiresAt < new Date()) {
      verificationCodes.delete(`phone_${userId}`);
      return false;
    }

    if (verification.code !== inputCode) {
      return false;
    }

    // Mark as verified (no database column for phone verification yet)
    verification.verified = true;
    
    // TODO: In future, add phoneVerified column to schema and update database
    // try {
    //   await db
    //     .update(users)
    //     .set({ phoneVerified: new Date() })
    //     .where(eq(users.id, userId));
    // } catch (error) {
    //   console.error('Error updating phone verification in database:', error);
    // }

    verificationCodes.delete(`phone_${userId}`);
    return true;
  }

  // Check if email is verified
  static async isEmailVerified(userId: string): Promise<boolean> {
    try {
      const user = await db
        .select({ emailVerified: users.emailVerified })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      return !!user[0]?.emailVerified;
    } catch (error) {
      return false;
    }
  }
  // Check if phone is verified
  static async isPhoneVerified(userId: string): Promise<boolean> {
    try {
      // Phone verification not implemented yet
      // In future, add phoneVerified column to schema
      return false;
    } catch (error) {
      return false;
    }
  }
}
