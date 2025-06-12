// Email Verification Service - Solo Email (Gratis)
import crypto from 'crypto';
import { db } from './database-postgres';
import { users } from './schema';
import { eq } from 'drizzle-orm';

interface EmailVerification {
  userId: string;
  email: string;
  code: string;
  expiresAt: Date;
}

// In-memory storage for demo (in production use Redis or database table)
const emailVerifications = new Map<string, EmailVerification>();

export class EmailVerificationService {
  
  // Generate 6-digit verification code
  static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send email verification with Gmail SMTP (FREE)
  static async sendEmailVerification(userId: string, email: string): Promise<{success: boolean, code?: string}> {
    try {
      const code = this.generateCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      // Store verification code
      emailVerifications.set(userId, {
        userId,
        email,
        code,
        expiresAt
      });

      // In development, just log the code (in production send real email)
      if (process.env.NODE_ENV === 'development') {
        console.log(`📧 CODICE VERIFICA EMAIL per ${email}: ${code}`);
        console.log(`⏰ Scadenza: ${expiresAt.toLocaleTimeString('it-IT')}`);
        return { success: true, code }; // Return code in dev for testing
      }

      // TODO: In production, integrate with real email service
      // Example with Resend or Gmail SMTP
      /*
      const emailContent = `
        <h2>🔐 Verifica il tuo indirizzo email - Maskio Barber</h2>
        <p>Ciao! Il tuo codice di verifica è:</p>
        <div style="font-size: 24px; font-weight: bold; color: #f59e0b; text-align: center; padding: 20px; border: 2px solid #f59e0b; border-radius: 10px; margin: 20px 0;">
          ${code}
        </div>
        <p>⏰ Il codice scadrà tra <strong>15 minuti</strong>.</p>
        <p>Se non hai richiesto questa verifica, ignora questa email.</p>
        <p>Grazie,<br>Team Maskio Barber</p>
      `;
      */
      
      return { success: true };
    } catch (error) {
      console.error('Error sending email verification:', error);
      return { success: false };
    }
  }

  // Verify email code
  static async verifyEmailCode(userId: string, inputCode: string): Promise<boolean> {
    const verification = emailVerifications.get(userId);
    
    if (!verification) {
      console.log(`❌ Nessuna verifica trovata per user: ${userId}`);
      return false;
    }

    if (verification.expiresAt < new Date()) {
      console.log(`⏰ Codice scaduto per user: ${userId}`);
      emailVerifications.delete(userId);
      return false;
    }

    if (verification.code !== inputCode) {
      console.log(`🔢 Codice errato per user: ${userId}`);
      return false;
    }

    // Mark as verified in database
    try {
      await db
        .update(users)
        .set({ emailVerified: new Date() })
        .where(eq(users.id, userId));
      
      console.log(`✅ Email verificata per user: ${userId}`);
      emailVerifications.delete(userId);
      return true;
    } catch (error) {
      console.error('Error updating email verification in database:', error);
      return false;
    }
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

  // Get verification status for user
  static async getVerificationStatus(userId: string): Promise<{
    isVerified: boolean,
    verifiedAt?: Date,
    hasPendingVerification: boolean
  }> {
    try {
      const user = await db
        .select({ emailVerified: users.emailVerified })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      const hasPendingVerification = emailVerifications.has(userId);
      
      return {
        isVerified: !!user[0]?.emailVerified,
        verifiedAt: user[0]?.emailVerified || undefined,
        hasPendingVerification
      };
    } catch (error) {
      return {
        isVerified: false,
        hasPendingVerification: false
      };
    }
  }

  // Resend verification code
  static async resendVerification(userId: string): Promise<{success: boolean, code?: string}> {
    const verification = emailVerifications.get(userId);
    
    if (!verification) {
      return { success: false };
    }

    // Delete old verification and send new one
    emailVerifications.delete(userId);
    return await this.sendEmailVerification(userId, verification.email);
  }
}
