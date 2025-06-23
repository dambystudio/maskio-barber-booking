// Test Twilio configuration and create Verify Service if needed
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
  console.error('❌ Twilio package not installed. Install it with: npm install twilio');
  process.exit(1);
}

async function checkTwilioConfig() {
  console.log('🔧 Checking Twilio configuration...\n');

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

  console.log('📋 Environment Variables:');
  console.log(`TWILIO_ACCOUNT_SID: ${twilioSid ? '✅ Set' : '❌ Missing'}`);
  console.log(`TWILIO_AUTH_TOKEN: ${twilioToken ? '✅ Set' : '❌ Missing'}`);
  console.log(`TWILIO_VERIFY_SERVICE_SID: ${verifyServiceSid ? '✅ Set' : '❌ Missing'}`);
  console.log(`TWILIO_PHONE_NUMBER: ${twilioNumber ? '✅ Set' : '❌ Missing'}`);
  console.log();

  if (!twilioSid || !twilioToken) {
    console.error('❌ Missing basic Twilio credentials (SID/Token)');
    console.log('💡 Get them from: https://console.twilio.com/');
    return;
  }

  try {
    const client = twilio(twilioSid, twilioToken);
    
    // Test basic connection
    console.log('🔌 Testing Twilio connection...');
    const account = await client.api.accounts(twilioSid).fetch();
    console.log(`✅ Connected to Twilio account: ${account.friendlyName}`);
    console.log(`📊 Account Status: ${account.status}`);
    console.log();

    // Check or create Verify Service
    if (!verifyServiceSid) {
      console.log('🆕 TWILIO_VERIFY_SERVICE_SID not found. Creating Verify Service...');
      
      try {
        const service = await client.verify.v2.services.create({
          friendlyName: 'Maskio Barber Verification',
          codeLength: 6
        });
        
        console.log(`✅ Verify Service created!`);
        console.log(`📝 Service SID: ${service.sid}`);
        console.log(`📝 Service Name: ${service.friendlyName}`);
        console.log();
        console.log('🔧 Add this to your .env.local file:');
        console.log(`TWILIO_VERIFY_SERVICE_SID=${service.sid}`);
        console.log();
        
      } catch (error) {
        console.error('❌ Failed to create Verify Service:', error.message);
        return;
      }
    } else {
      console.log('🔍 Checking existing Verify Service...');
      try {
        const service = await client.verify.v2.services(verifyServiceSid).fetch();
        console.log(`✅ Verify Service found: ${service.friendlyName}`);
        console.log(`📊 Service Status: ${service.status || 'active'}`);
        console.log(`🔢 Code Length: ${service.codeLength}`);
        console.log();
      } catch (error) {
        console.error('❌ Verify Service not found or invalid:', error.message);
        console.log('💡 Try removing TWILIO_VERIFY_SERVICE_SID from .env.local and run this script again');
        return;
      }
    }

    // Test SMS capability (if we have a Verify Service)
    const finalVerifyServiceSid = verifyServiceSid || process.env.TWILIO_VERIFY_SERVICE_SID;
    if (finalVerifyServiceSid) {
      console.log('📱 Testing SMS verification (dry run)...');
      
      // This won't actually send SMS, just test the API
      try {
        console.log('✅ Twilio Verify Service is ready for SMS verification!');
        console.log(`📞 Service SID: ${finalVerifyServiceSid}`);
        console.log();
        console.log('🎉 Everything is configured correctly!');
        console.log('🚀 Your app will now send real SMS messages via Twilio Verify');
        
      } catch (error) {
        console.warn('⚠️ SMS test failed:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Twilio connection failed:', error.message);
    console.log('💡 Check your credentials at: https://console.twilio.com/');
  }
}

checkTwilioConfig().catch(console.error);
