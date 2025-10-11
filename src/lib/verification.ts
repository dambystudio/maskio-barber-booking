// Email and Phone Verification System
import crypto from 'crypto';
import { db } from './database-postgres';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

interface VerificationCode {
  userId: string;
  email?: string;
  phone?: string;
  code: string;
  type: 'email' | 'phone';
  expiresAt: Date;
  verified: boolean;
}

// Persistent storage for verification codes (for development)
const TEMP_STORAGE_PATH = path.join(process.cwd(), '.verification-codes.json');

class VerificationStorage {
  private static loadCodes(): Map<string, VerificationCode> {
    console.log(`📂 Loading codes from: ${TEMP_STORAGE_PATH}`);
    try {
      if (fs.existsSync(TEMP_STORAGE_PATH)) {
        console.log(`📂 File exists, reading...`);
        const data = fs.readFileSync(TEMP_STORAGE_PATH, 'utf8');
        console.log(`📂 File content:`, data);
        const parsed = JSON.parse(data);
        const map = new Map<string, VerificationCode>();
        
        // Convert back to Map and check expiration
        Object.entries(parsed).forEach(([key, value]: [string, any]) => {
          const code = {
            ...value,
            expiresAt: new Date(value.expiresAt)
          };
          
          console.log(`📂 Processing code: ${key}, expires: ${code.expiresAt}, now: ${new Date()}`);
          
          // Only keep non-expired codes
          if (code.expiresAt > new Date()) {
            map.set(key, code);
            console.log(`📂 Code ${key} added to map`);
          } else {
            console.log(`📂 Code ${key} expired, skipping`);
          }
        });
        
        console.log(`📂 Loaded ${map.size} valid codes`);
        return map;
      } else {
        console.log(`📂 File does not exist`);
      }
    } catch (error) {
      console.warn('Error loading verification codes:', error);
    }
    return new Map<string, VerificationCode>();
  }

  private static saveCodes(codes: Map<string, VerificationCode>): void {
    try {
      const obj = Object.fromEntries(codes);
      fs.writeFileSync(TEMP_STORAGE_PATH, JSON.stringify(obj, null, 2));
    } catch (error) {
      console.warn('Error saving verification codes:', error);
    }
  }

  static get(key: string): VerificationCode | undefined {
    console.log(`🔍 Loading verification code - Key: ${key}`);
    const codes = this.loadCodes();
    console.log(`🔍 Total codes loaded:`, codes.size);
    console.log(`🔍 All keys:`, Array.from(codes.keys()));
    const result = codes.get(key);
    console.log(`🔍 Found result:`, result);
    return result;
  }

  static set(key: string, value: VerificationCode): void {
    console.log(`💾 Saving verification code - Key: ${key}, Value:`, value);
    const codes = this.loadCodes();
    codes.set(key, value);
    console.log(`💾 Total codes before save:`, codes.size);
    this.saveCodes(codes);
    console.log(`💾 File saved to: ${TEMP_STORAGE_PATH}`);
  }

  static delete(key: string): void {
    const codes = this.loadCodes();
    codes.delete(key);
    this.saveCodes(codes);
  }
  static keys(): string[] {
    const codes = this.loadCodes();
    return Array.from(codes.keys());
  }
}

// Rate limiting removed - SMS functionality not needed

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
      VerificationStorage.set(`email_${userId}`, {
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

  // SMS verification removed - not needed for this application

  // Verify email code
  static async verifyEmailCode(userId: string, inputCode: string): Promise<boolean> {
    const storageKey = `email_${userId}`;
    const verification = VerificationStorage.get(storageKey);
    
    if (!verification || verification.type !== 'email') {
      return false;
    }

    if (verification.expiresAt < new Date()) {
      VerificationStorage.delete(storageKey);
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

    VerificationStorage.delete(storageKey);
    return true;
  }

  // Phone verification removed - not needed for this application

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

  // Phone verification removed - not needed for this application
}
