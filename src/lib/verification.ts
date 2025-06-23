// Email and Phone Verification System
import crypto from 'crypto';
import { db } from './database-postgres';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

// Import Twilio
let twilio: any;
try {
  twilio = require('twilio');
} catch (error) {
  console.warn('Twilio not available, SMS will use simulation mode');
}

interface VerificationCode {
  userId: string;
  email?: string;
  phone?: string;
  code: string;
  type: 'email' | 'phone';
  expiresAt: Date;
  verified: boolean;
}

interface RateLimitInfo {
  phone: string;
  attempts: number;
  firstAttempt: Date;
  lastAttempt: Date;
  blockedUntil?: Date;
}

// Persistent storage for verification codes (for development)
const TEMP_STORAGE_PATH = path.join(process.cwd(), '.verification-codes.json');
const RATE_LIMIT_STORAGE_PATH = path.join(process.cwd(), '.sms-rate-limits.json');

// Rate limiting configuration
const MAX_SMS_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW_MINUTES = 15; // 15 minutes window
const BLOCK_DURATION_MINUTES = 30; // Block for 30 minutes after limit exceeded

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

class RateLimitStorage {
  private static loadLimits(): Map<string, RateLimitInfo> {
    try {
      if (fs.existsSync(RATE_LIMIT_STORAGE_PATH)) {
        const data = fs.readFileSync(RATE_LIMIT_STORAGE_PATH, 'utf8');
        const parsed = JSON.parse(data);
        const map = new Map<string, RateLimitInfo>();
        
        // Convert back to Map and parse dates
        Object.entries(parsed).forEach(([key, value]: [string, any]) => {
          const rateLimit = {
            ...value,
            firstAttempt: new Date(value.firstAttempt),
            lastAttempt: new Date(value.lastAttempt),
            blockedUntil: value.blockedUntil ? new Date(value.blockedUntil) : undefined
          };
          map.set(key, rateLimit);
        });
        
        return map;
      }
    } catch (error) {
      console.warn('Error loading rate limits:', error);
    }
    return new Map<string, RateLimitInfo>();
  }

  private static saveLimits(limits: Map<string, RateLimitInfo>): void {
    try {
      const obj = Object.fromEntries(limits);
      fs.writeFileSync(RATE_LIMIT_STORAGE_PATH, JSON.stringify(obj, null, 2));
    } catch (error) {
      console.warn('Error saving rate limits:', error);
    }
  }

  static checkRateLimit(phone: string): { allowed: boolean; remaining: number; resetTime?: Date; blockedUntil?: Date } {
    const normalizedPhone = phone.replace(/\s/g, '');
    const limits = this.loadLimits();
    const now = new Date();
    
    console.log(`🔒 Checking rate limit for ${normalizedPhone}`);
    
    const rateLimit = limits.get(normalizedPhone);
    
    if (!rateLimit) {
      // First attempt for this number
      console.log(`🔒 First attempt for ${normalizedPhone}`);
      return { allowed: true, remaining: MAX_SMS_ATTEMPTS - 1 };
    }
    
    // Check if currently blocked
    if (rateLimit.blockedUntil && rateLimit.blockedUntil > now) {
      console.log(`🚫 Phone ${normalizedPhone} is blocked until ${rateLimit.blockedUntil}`);
      return { 
        allowed: false, 
        remaining: 0, 
        blockedUntil: rateLimit.blockedUntil 
      };
    }
    
    // Check if window has expired (reset counter)
    const windowStart = new Date(rateLimit.firstAttempt);
    const windowEnd = new Date(windowStart.getTime() + RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
    
    if (now > windowEnd) {
      // Window expired, reset counter
      console.log(`🔒 Rate limit window expired for ${normalizedPhone}, resetting`);
      return { allowed: true, remaining: MAX_SMS_ATTEMPTS - 1 };
    }
    
    // Check attempts within current window
    if (rateLimit.attempts >= MAX_SMS_ATTEMPTS) {
      // Set block time if not already set
      const blockedUntil = new Date(now.getTime() + BLOCK_DURATION_MINUTES * 60 * 1000);
      console.log(`🚫 Rate limit exceeded for ${normalizedPhone}, blocking until ${blockedUntil}`);
      
      // Update with block time
      rateLimit.blockedUntil = blockedUntil;
      limits.set(normalizedPhone, rateLimit);
      this.saveLimits(limits);
      
      return { 
        allowed: false, 
        remaining: 0, 
        blockedUntil: blockedUntil 
      };
    }
    
    const remaining = MAX_SMS_ATTEMPTS - rateLimit.attempts;
    console.log(`🔒 Phone ${normalizedPhone} has ${remaining} attempts remaining`);
    
    return { 
      allowed: true, 
      remaining: remaining - 1, // -1 because we're about to use one
      resetTime: windowEnd 
    };
  }

  static recordAttempt(phone: string): void {
    const normalizedPhone = phone.replace(/\s/g, '');
    const limits = this.loadLimits();
    const now = new Date();
    
    console.log(`📝 Recording SMS attempt for ${normalizedPhone}`);
    
    const existing = limits.get(normalizedPhone);
    
    if (!existing) {
      // First attempt
      limits.set(normalizedPhone, {
        phone: normalizedPhone,
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      });
    } else {
      // Check if we need to reset the window
      const windowStart = new Date(existing.firstAttempt);
      const windowEnd = new Date(windowStart.getTime() + RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
      
      if (now > windowEnd) {
        // Reset window
        limits.set(normalizedPhone, {
          phone: normalizedPhone,
          attempts: 1,
          firstAttempt: now,
          lastAttempt: now
        });
      } else {
        // Increment attempts
        existing.attempts += 1;
        existing.lastAttempt = now;
        limits.set(normalizedPhone, existing);
      }
    }
    
    this.saveLimits(limits);
  }

  static getRemainingTime(phone: string): { blocked: boolean; remainingMinutes?: number } {
    const normalizedPhone = phone.replace(/\s/g, '');
    const limits = this.loadLimits();
    const rateLimit = limits.get(normalizedPhone);
    
    if (!rateLimit || !rateLimit.blockedUntil) {
      return { blocked: false };
    }
    
    const now = new Date();
    if (rateLimit.blockedUntil <= now) {
      return { blocked: false };
    }
    
    const remainingMs = rateLimit.blockedUntil.getTime() - now.getTime();
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    
    return { blocked: true, remainingMinutes };
  }
}

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
  // Send SMS verification using Twilio Verify Service
  static async sendSMSVerification(userId: string, phone: string): Promise<{ success: boolean; error?: string; rateLimitInfo?: any }> {
    try {
      // Check rate limit first
      const rateLimitCheck = RateLimitStorage.checkRateLimit(phone);
      
      if (!rateLimitCheck.allowed) {
        const remainingTime = RateLimitStorage.getRemainingTime(phone);
        const errorMessage = remainingTime.blocked 
          ? `Troppi tentativi. Riprova tra ${remainingTime.remainingMinutes} minuti.`
          : 'Limite di invii SMS raggiunto. Riprova più tardi.';
          
        console.log(`🚫 SMS rate limit exceeded for ${phone}:`, errorMessage);
        return { 
          success: false, 
          error: errorMessage,
          rateLimitInfo: {
            blocked: true,
            blockedUntil: rateLimitCheck.blockedUntil,
            remainingMinutes: remainingTime.remainingMinutes
          }
        };
      }

      // Normalize phone number for consistent key generation
      const normalizedPhone = phone.replace(/\+/g, '').replace(/\s/g, '');
      const storageKey = `phone_${userId.replace(/\+/g, '')}`;
      
      console.log(`📱 Sending SMS - User: ${userId}, Phone: ${phone}, Remaining attempts: ${rateLimitCheck.remaining}`);

      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioToken = process.env.TWILIO_AUTH_TOKEN;
      const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

      if (!twilioSid || !twilioToken || !verifyServiceSid) {
        console.warn('⚠️ Twilio Verify credentials not configured, SMS simulation mode');
        const code = this.generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        
        VerificationStorage.set(storageKey, {
          userId,
          phone,
          code,
          type: 'phone',
          expiresAt,
          verified: false
        });
        
        // Record the attempt
        RateLimitStorage.recordAttempt(phone);
        
        console.log(`📱 [SIMULATION] SMS to ${phone}: Your verification code is ${code}`);
        return { 
          success: true,
          rateLimitInfo: {
            remaining: rateLimitCheck.remaining,
            resetTime: rateLimitCheck.resetTime
          }
        };      }
      
      if (!twilio) {
        console.warn('⚠️ Twilio package not available, SMS simulation mode');
        const code = this.generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        
        VerificationStorage.set(storageKey, {
          userId,
          phone,
          code,
          type: 'phone',
          expiresAt,
          verified: false
        });
        
        // Record the attempt
        RateLimitStorage.recordAttempt(phone);
        
        console.log(`📱 [SIMULATION] SMS to ${phone}: Your verification code is ${code}`);
        return { 
          success: true,
          rateLimitInfo: {
            remaining: rateLimitCheck.remaining,
            resetTime: rateLimitCheck.resetTime
          }
        };
      }
      
      // Use Twilio Verify Service (more professional)
      const twilioClient = twilio(twilioSid, twilioToken);
      
      const verification = await twilioClient.verify.v2
        .services(verifyServiceSid)
        .verifications
        .create({
          to: phone,
          channel: 'sms',
          locale: 'it' // Italian language
        });
      
      console.log(`✅ SMS verification sent to ${phone}, Status: ${verification.status}`);
      
      // Store a reference for tracking with consistent key
      VerificationStorage.set(storageKey, {
        userId,
        phone,
        code: 'verify_service', // Placeholder since Twilio manages the code
        type: 'phone',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        verified: false
      });
      
      // Record the attempt
      RateLimitStorage.recordAttempt(phone);
      
      return { 
        success: verification.status === 'pending',
        rateLimitInfo: {
          remaining: rateLimitCheck.remaining,
          resetTime: rateLimitCheck.resetTime
        }
      };
        
    } catch (error: any) {
      console.error('❌ Error sending SMS verification:', error);
      
      // Fallback to simulation mode
      const code = this.generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const normalizedPhone = phone.replace(/\+/g, '').replace(/\s/g, '');
      const storageKey = `phone_${userId.replace(/\+/g, '')}`;
      
      VerificationStorage.set(storageKey, {
        userId,
        phone,
        code,
        type: 'phone',
        expiresAt,
        verified: false
      });
      
      // Record the attempt even in error case
      RateLimitStorage.recordAttempt(phone);
      
      console.log(`📱 [FALLBACK] SMS simulation for ${phone}: ${code}`);
      return { 
        success: true,
        rateLimitInfo: {
          remaining: RateLimitStorage.checkRateLimit(phone).remaining,
          resetTime: RateLimitStorage.checkRateLimit(phone).resetTime
        }
      };
    }
  }
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
  }  // Verify phone code
  static async verifyPhoneCode(userId: string, inputCode: string): Promise<boolean> {
    try {
      const normalizedUserId = userId.replace(/\+/g, '');
      const storageKey = `phone_${normalizedUserId}`;
      
      console.log(`🔍 Verifying phone code - UserId: ${userId}, StorageKey: ${storageKey}, InputCode: ${inputCode}`);
      
      const verification = VerificationStorage.get(storageKey);
      console.log(`🔍 Found verification:`, verification);
      
      if (!verification || verification.type !== 'phone') {
        console.log(`❌ No verification found or wrong type`);
        return false;
      }

      if (verification.expiresAt < new Date()) {
        console.log(`❌ Verification expired`);
        VerificationStorage.delete(storageKey);
        return false;
      }

      // Handle both direct codes and Twilio Verify Service
      if (verification.code === 'verify_service') {
        console.log(`🔍 Using Twilio Verify Service`);
        
        // Use Twilio Verify Service to check the code
        const twilioSid = process.env.TWILIO_ACCOUNT_SID;
        const twilioToken = process.env.TWILIO_AUTH_TOKEN;
        const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

        if (!twilioSid || !twilioToken || !verifyServiceSid || !twilio) {
          console.log(`❌ Twilio not configured for verification`);
          return false;
        }

        const twilioClient = twilio(twilioSid, twilioToken);
        
        try {
          const verificationCheck = await twilioClient.verify.v2
            .services(verifyServiceSid)
            .verificationChecks
            .create({
              to: verification.phone,
              code: inputCode
            });

          console.log(`🔍 Twilio verification result:`, verificationCheck.status);
          
          if (verificationCheck.status === 'approved') {
            verification.verified = true;
            VerificationStorage.delete(storageKey);
            return true;
          } else {
            return false;
          }
        } catch (error) {
          console.error('❌ Twilio verification check error:', error);
          return false;
        }
      } else {
        // Direct code comparison for simulation mode
        if (verification.code !== inputCode) {
          console.log(`❌ Code mismatch: expected ${verification.code}, got ${inputCode}`);
          return false;
        }

        console.log(`✅ Phone verification successful`);
        verification.verified = true;
        VerificationStorage.delete(storageKey);
        return true;
      }
    } catch (error) {
      console.error('❌ Error in verifyPhoneCode:', error);
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
