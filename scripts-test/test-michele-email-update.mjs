// Test per verificare che l'email di Michele sia aggiornata correttamente
async function testMicheleEmailUpdate() {
    console.log('🔍 Testing Michele email configuration...');
    
    try {
        // 1. Test configurazione environment
        console.log('\n1️⃣ Checking environment configuration...');
        const response = await fetch('http://localhost:3000/api/debug/check-permissions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: 'michelebiancofiore0230@gmail.com' 
            })
        });
        
        const data = await response.json();
        console.log('Response:', data);
        
        if (data.success && data.permissions?.isBarber) {
            console.log('✅ Michele email correctly configured as barber');
        } else {
            console.log('❌ Michele email not recognized as barber');
        }
        
        // 2. Test con la vecchia email (dovrebbe fallire)
        console.log('\n2️⃣ Testing old email (should fail)...');
        const oldEmailResponse = await fetch('http://localhost:3000/api/debug/check-permissions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: 'micheleprova@gmail.com' 
            })
        });
        
        const oldEmailData = await oldEmailResponse.json();
        console.log('Old email response:', oldEmailData);
        
        if (!oldEmailData.permissions?.isBarber) {
            console.log('✅ Old email correctly not recognized as barber');
        } else {
            console.log('⚠️ Old email still recognized as barber');
        }
        
        // 3. Test BARBER_EMAILS configuration
        console.log('\n3️⃣ Testing BARBER_EMAILS configuration...');
        const configResponse = await fetch('http://localhost:3000/api/debug/config', {
            method: 'GET'
        });
        
        if (configResponse.ok) {
            const configData = await configResponse.json();
            console.log('BARBER_EMAILS config:', configData.barberEmails);
            
            if (configData.barberEmails?.includes('michelebiancofiore0230@gmail.com')) {
                console.log('✅ New Michele email found in BARBER_EMAILS');
            } else {
                console.log('❌ New Michele email not found in BARBER_EMAILS');
            }
            
            if (!configData.barberEmails?.includes('micheleprova@gmail.com')) {
                console.log('✅ Old Michele email not found in BARBER_EMAILS');
            } else {
                console.log('⚠️ Old Michele email still in BARBER_EMAILS');
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testMicheleEmailUpdate();
