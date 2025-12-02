# 🤖 N8N Automation Setup per Verifica SMS/WhatsApp

## 📋 Overview Architettura

```
Maskio Barber App → N8N Webhook → [SMS Provider | WhatsApp] → Utente
                                      ↓
                                 Database Log
```

## 🔧 Setup N8N Workflow

### 1. Installazione N8N

```bash
# Opzione 1: Docker (Raccomandato)
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n

# Opzione 2: npm
npm install n8n -g
n8n start
```

### 2. Configurazione Workflow "SMS_Verification"

#### Nodes necessari:
1. **Webhook Trigger** - Riceve richieste da Maskio Barber
2. **Function Node** - Genera codice e valida dati
3. **Switch Node** - Decide SMS vs WhatsApp
4. **HTTP Request** - Invia SMS (provider economico)
5. **WhatsApp Business** - Invia via WhatsApp
6. **Database** - Salva log verifica
7. **Response** - Risponde all'app

### 3. JSON Workflow Configuration

```json
{
  "name": "Maskio_SMS_Verification",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "send-verification",
        "responseMode": "responseNode"
      },
      "name": "Webhook_Receive",
      "type": "n8n-nodes-base.webhook",
      "position": [240, 300]
    },
    {
      "parameters": {
        "functionCode": "// Genera codice verifica\nconst code = Math.floor(100000 + Math.random() * 900000).toString();\nconst phone = items[0].json.phone;\nconst userId = items[0].json.userId;\nconst method = items[0].json.method || 'sms'; // sms | whatsapp\n\n// Valida numero italiano\nconst phoneRegex = /^\\+39\\s?\\d{3}\\s?\\d{3}\\s?\\d{4}$/;\nif (!phoneRegex.test(phone.replace(/\\s/g, ''))) {\n  throw new Error('Formato numero non valido');\n}\n\n// Prepara dati per prossimi nodi\nreturn [{\n  json: {\n    userId,\n    phone: phone.replace(/\\s/g, ''),\n    code,\n    method,\n    timestamp: new Date().toISOString(),\n    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()\n  }\n}];"
      },
      "name": "Generate_Code",
      "type": "n8n-nodes-base.function",
      "position": [460, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.method}}",
              "operation": "equal",
              "value2": "whatsapp"
            }
          ]
        }
      },
      "name": "Method_Switch",
      "type": "n8n-nodes-base.switch",
      "position": [680, 300]
    }
  ],
  "connections": {
    "Webhook_Receive": {
      "main": [["Generate_Code"]]
    },
    "Generate_Code": {
      "main": [["Method_Switch"]]
    }
  }
}
```

## 🔗 Integrazione con Maskio Barber

### 1. Aggiornare Verification Service

```typescript
// src/lib/verification-n8n.ts
export class N8NVerificationService {
  private static N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/send-verification';
  
  static async sendVerification(userId: string, phone: string, method: 'sms' | 'whatsapp' = 'sms'): Promise<boolean> {
    try {
      const response = await fetch(this.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          phone,
          method
        })
      });
      
      if (!response.ok) {
        throw new Error(`N8N Error: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ N8N verification sent:', result);
      
      // Store verification code locally for validation
      this.storeVerificationCode(userId, result.code, result.expiresAt);
      
      return true;
    } catch (error) {
      console.error('❌ N8N verification failed:', error);
      return false;
    }
  }
  
  private static storeVerificationCode(userId: string, code: string, expiresAt: string) {
    // Implementa storage locale o Redis
    // Per ora usiamo Map come backup
    verificationCodes.set(`phone_${userId}`, {
      userId,
      code,
      type: 'phone',
      expiresAt: new Date(expiresAt),
      verified: false
    });
  }
}
```

### 2. Provider SMS Economici per N8N

#### Opzione A: TextMagic (€0.04/SMS)
```json
{
  "parameters": {
    "url": "https://rest.textmagic.com/api/v2/messages",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "httpBasicAuth",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "phones",
          "value": "={{$json.phone}}"
        },
        {
          "name": "text",
          "value": "Il tuo codice Maskio Barber: {{$json.code}}. Scade tra 10 minuti."
        }
      ]
    }
  },
  "name": "Send_SMS_TextMagic",
  "type": "n8n-nodes-base.httpRequest"
}
```

#### Opzione B: Bulk SMS (€0.03/SMS)
```json
{
  "parameters": {
    "url": "https://api.bulksms.com/v1/messages",
    "authentication": "predefinedCredentialType", 
    "nodeCredentialType": "httpBasicAuth",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "to",
          "value": "={{$json.phone}}"
        },
        {
          "name": "body",
          "value": "Maskio Barber - Codice verifica: {{$json.code}}"
        }
      ]
    }
  },
  "name": "Send_SMS_BulkSMS",
  "type": "n8n-nodes-base.httpRequest"
}
```

### 3. WhatsApp Business Integration

```json
{
  "parameters": {
    "url": "https://graph.facebook.com/v17.0/{{$secrets.WHATSAPP_PHONE_NUMBER_ID}}/messages",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Authorization",
          "value": "Bearer {{$secrets.WHATSAPP_ACCESS_TOKEN}}"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "messaging_product",
          "value": "whatsapp"
        },
        {
          "name": "to",
          "value": "={{$json.phone}}"
        },
        {
          "name": "type",
          "value": "template"
        },
        {
          "name": "template",
          "value": {
            "name": "verification_code",
            "language": {"code": "it"},
            "components": [
              {
                "type": "body",
                "parameters": [
                  {"type": "text", "text": "{{$json.code}}"}
                ]
              }
            ]
          }
        }
      ]
    }
  },
  "name": "Send_WhatsApp",
  "type": "n8n-nodes-base.httpRequest"
}
```

## 💰 Confronto Costi

### N8N + Provider Economico:
- **Server N8N**: €5-15/mese (VPS)
- **SMS via BulkSMS**: €0.03/SMS
- **WhatsApp Business**: €0.01/messaggio
- **Setup**: Tempo iniziale maggiore

### Twilio:
- **SMS**: €0.05-0.10/SMS
- **WhatsApp**: €0.02-0.04/messaggio  
- **Setup**: Più veloce

### Risparmio con N8N:
- **100 SMS/mese**: €2 vs €5-10 (risparmio 60-80%)
- **1000 SMS/mese**: €30 vs €50-100 (risparmio 40-70%)

## 🚀 Implementazione Consigliata

Creo il nuovo service N8N?
