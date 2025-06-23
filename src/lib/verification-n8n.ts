// N8N-based verification service
import crypto from 'crypto';
import { db } from './database-postgres';
import { users } from './schema';
import { eq } from 'drizzle-orm';

interface VerificationCode {
  userId: string;
  phone: string;
  code: string;
  method: 'sms' | 'whatsapp';
  expiresAt: Date;
  verified: boolean;
}

// In-memory storage (in production use Redis)
const verificationCodes = new Map<string, VerificationCode>();

export class N8NVerificationService {
  private static N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/send-verification';
  private static N8N_API_KEY = process.env.N8N_API_KEY; // Per sicurezza aggiuntiva
  
  // Generate 6-digit verification code
  static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send verification via N8N (SMS or WhatsApp)
  static async sendVerification(
    userId: string, 
    phone: string, 
    method: 'sms' | 'whatsapp' = 'sms'
  ): Promise<{ success: boolean; message: string; method: string }> {
    try {
      const code = this.generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Store verification code locally
      verificationCodes.set(`phone_${userId}`, {
        userId,
        phone,
        code,
        method,
        expiresAt,
        verified: false
      });

      // Validate phone format
      const phoneRegex = /^\+39\s?\d{3}\s?\d{3}\s?\d{4}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        throw new Error('Formato numero non valido. Usa: +39 XXX XXX XXXX');
      }

      // Prepare N8N payload
      const payload = {
        userId,
        phone: phone.replace(/\s/g, ''), // Clean phone number
        code,
        method,
        timestamp: new Date().toISOString()
      };

      // Add API key if configured
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (this.N8N_API_KEY) {
        headers['Authorization'] = `Bearer ${this.N8N_API_KEY}`;
      }

      console.log(`📡 Sending ${method.toUpperCase()} verification to N8N:`, { 
        phone, 
        method, 
        webhook: this.N8N_WEBHOOK_URL 
      });      // Send to N8N webhook
      const response = await fetch(this.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ N8N webhook error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        // Fallback: still store code for manual testing
        if (process.env.NODE_ENV === 'development') {
          console.log(`📱 [FALLBACK] ${method.toUpperCase()} code for ${phone}: ${code}`);
          return {
            success: true,
            message: `${method.toUpperCase()} simulato (N8N non disponibile) - Codice: ${code}`,
            method: `${method}-fallback`
          };
        }
        
        throw new Error(`N8N webhook failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ N8N verification sent successfully:', result);

      return {
        success: true,
        message: `${method === 'sms' ? 'SMS' : 'Messaggio WhatsApp'} inviato con successo`,
        method
      };
      
    } catch (error: any) {
      console.error('❌ N8N verification service error:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        const verification = verificationCodes.get(`phone_${userId}`);
        console.log(`📱 [DEV FALLBACK] ${method.toUpperCase()} code for ${phone}: ${verification?.code}`);
        return {
          success: true,
          message: `${method.toUpperCase()} simulato (modalità sviluppo) - Codice: ${verification?.code}`,
          method: `${method}-dev`
        };
      }
      
      return {
        success: false,
        message: `Errore nell'invio ${method === 'sms' ? 'SMS' : 'WhatsApp'}: ${error.message}`,
        method
      };
    }
  }

  // Send SMS specifically
  static async sendSMSVerification(userId: string, phone: string): Promise<boolean> {
    const result = await this.sendVerification(userId, phone, 'sms');
    return result.success;
  }

  // Send WhatsApp specifically  
  static async sendWhatsAppVerification(userId: string, phone: string): Promise<boolean> {
    const result = await this.sendVerification(userId, phone, 'whatsapp');
    return result.success;
  }

  // Try WhatsApp first, fallback to SMS
  static async sendVerificationWithFallback(userId: string, phone: string): Promise<{
    success: boolean;
    method: string;
    message: string;
  }> {
    try {
      // Try WhatsApp first (cheaper and better UX)
      console.log('🔄 Attempting WhatsApp verification first...');
      const whatsappResult = await this.sendVerification(userId, phone, 'whatsapp');
      
      if (whatsappResult.success) {
        return whatsappResult;
      }
      
      // Fallback to SMS
      console.log('🔄 WhatsApp failed, falling back to SMS...');
      const smsResult = await this.sendVerification(userId, phone, 'sms');
      
      if (smsResult.success) {
        return {
          ...smsResult,
          message: 'WhatsApp non disponibile, SMS inviato come alternativa'
        };
      }
      
      throw new Error('Entrambi WhatsApp e SMS hanno fallito');
      
    } catch (error: any) {
      console.error('❌ Both verification methods failed:', error);
      return {
        success: false,
        method: 'none',
        message: 'Impossibile inviare verifica. Riprova più tardi.'
      };
    }
  }

  // Verify phone code (same as before)
  static async verifyPhoneCode(userId: string, inputCode: string): Promise<boolean> {
    const verification = verificationCodes.get(`phone_${userId}`);
    
    if (!verification) {
      console.error('❌ No verification found for user:', userId);
      return false;
    }

    if (verification.expiresAt < new Date()) {
      console.error('❌ Verification code expired for user:', userId);
      verificationCodes.delete(`phone_${userId}`);
      return false;
    }

    if (verification.code !== inputCode.trim()) {
      console.error('❌ Invalid verification code for user:', userId);
      return false;
    }

    // Mark as verified
    verification.verified = true;
    console.log(`✅ Phone verification successful for user ${userId} via ${verification.method}`);
    
    // TODO: Save to database in future
    // try {
    //   await db
    //     .update(users)
    //     .set({ 
    //       phoneVerified: new Date(),
    //       phoneVerificationMethod: verification.method 
    //     })
    //     .where(eq(users.id, userId));
    // } catch (error) {
    //   console.error('Error updating phone verification in database:', error);
    // }

    verificationCodes.delete(`phone_${userId}`);
    return true;
  }

  // Check if phone is verified
  static async isPhoneVerified(userId: string): Promise<boolean> {
    const verification = verificationCodes.get(`phone_${userId}`);
    return verification?.verified || false;
  }

  // Get verification info for debugging
  static getVerificationInfo(userId: string): VerificationCode | null {
    return verificationCodes.get(`phone_${userId}`) || null;
  }

  // Clear expired codes (cleanup method)
  static cleanupExpiredCodes(): number {
    const now = new Date();
    let cleaned = 0;
    
    for (const [key, verification] of verificationCodes.entries()) {
      if (verification.expiresAt < now) {
        verificationCodes.delete(key);
        cleaned++;
      }
    }
    
    console.log(`🧹 Cleaned up ${cleaned} expired verification codes`);
    return cleaned;
  }
}
