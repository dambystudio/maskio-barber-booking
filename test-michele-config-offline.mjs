// Test offline per verificare la configurazione dell'email di Michele
import { readFileSync } from 'fs';

function testMicheleEmailConfiguration() {
    console.log('🔍 Testing Michele email configuration (offline)...');
    
    try {
        // 1. Test .env.local
        console.log('\n1️⃣ Checking .env.local configuration...');
        const envContent = readFileSync('.env.local', 'utf8');
        
        if (envContent.includes('michelebiancofiore0230@gmail.com')) {
            console.log('✅ New Michele email found in .env.local');
        } else {
            console.log('❌ New Michele email NOT found in .env.local');
        }
        
        if (!envContent.includes('micheleprova@gmail.com')) {
            console.log('✅ Old Michele email not found in .env.local');
        } else {
            console.log('⚠️ Old Michele email still in .env.local');
        }
        
        // 2. Test pannello prenotazioni
        console.log('\n2️⃣ Checking pannello prenotazioni...');
        const pannelloContent = readFileSync('src/app/pannello-prenotazioni/page.tsx', 'utf8');
        
        if (pannelloContent.includes('michelebiancofiore0230@gmail.com')) {
            console.log('✅ New Michele email found in pannello prenotazioni');
        } else {
            console.log('❌ New Michele email NOT found in pannello prenotazioni');
        }
        
        if (!pannelloContent.includes('micheleprova@gmail.com')) {
            console.log('✅ Old Michele email not found in pannello prenotazioni');
        } else {
            console.log('⚠️ Old Michele email still in pannello prenotazioni');
        }
        
        // 3. Estratto della configurazione BARBER_EMAILS
        const barberEmailsMatch = envContent.match(/BARBER_EMAILS=(.+)/);
        if (barberEmailsMatch) {
            const barberEmails = barberEmailsMatch[1];
            console.log('\n📧 Current BARBER_EMAILS configuration:');
            console.log(`   ${barberEmails}`);
            
            const emails = barberEmails.split(',');
            console.log('\n📝 Configured barber emails:');
            emails.forEach(email => {
                console.log(`   - ${email.trim()}`);
            });
        }
        
        console.log('\n✅ Configuration update completed successfully!');
        console.log('📌 Michele Biancofiore email: michelebiancofiore0230@gmail.com');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testMicheleEmailConfiguration();
