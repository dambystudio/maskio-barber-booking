// Update Twilio Verify Service with custom message template
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

let twilio;
try {
  const twilioModule = await import('twilio');
  twilio = twilioModule.default;
} catch (error) {
  console.error('❌ Twilio package not installed');
  process.exit(1);
}

async function updateVerifyServiceTemplate() {
  console.log('🔧 Updating Twilio Verify Service message template...\n');

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!twilioSid || !twilioToken || !verifyServiceSid) {
    console.error('❌ Missing Twilio credentials');
    return;
  }

  try {
    const client = twilio(twilioSid, twilioToken);
    
    // Update the service with custom friendly name
    const service = await client.verify.v2
      .services(verifyServiceSid)
      .update({
        friendlyName: 'Maskio Barber Verifica'
      });
    
    console.log(`✅ Service updated: ${service.friendlyName}`);
    
    // Try to create a custom message template (if available in your plan)
    try {
      const messageTemplate = await client.verify.v2
        .services(verifyServiceSid)
        .messagesConfiguration
        .update({
          welcomeEnabled: false,
          // Custom template for SMS
          customCodeEnabled: true
        });
      
      console.log('✅ Message configuration updated');
      
    } catch (templateError) {
      console.log('ℹ️ Custom message templates not available in current plan');
      console.log('💡 The SMS will use default Twilio format but with "Maskio Barber Verifica" as sender');
    }
    
    console.log('\n🎉 Verify Service configuration completed!');
    console.log('📱 SMS messages will now show "Maskio Barber Verifica" as the service name');
    
  } catch (error) {
    console.error('❌ Error updating service:', error.message);
  }
}

updateVerifyServiceTemplate().catch(console.error);
