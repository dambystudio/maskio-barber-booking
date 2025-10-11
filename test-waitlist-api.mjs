import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testWaitlistAPI() {
  try {
    console.log('🧪 TEST API /api/waitlist (POST)\n');
    console.log('='.repeat(80));
    
    const testData = {
      barberId: 'michele',
      date: '2025-12-05',
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      customerPhone: '1234567890'
    };
    
    console.log('\n📤 Invio richiesta con dati:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('');
    
    const response = await fetch('http://localhost:3001/api/waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`📡 Status: ${response.status} ${response.statusText}\n`);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS!\n');
      console.log('📋 Risposta:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ ERRORE!\n');
      console.log('📋 Risposta:');
      console.log(JSON.stringify(data, null, 2));
    }
    
    // Se ha avuto successo, prova a recuperare la waitlist
    if (response.ok) {
      console.log('\n' + '='.repeat(80));
      console.log('🧪 TEST GET /api/waitlist\n');
      
      const getResponse = await fetch(`http://localhost:3001/api/waitlist?user_email=${encodeURIComponent(testData.customerEmail)}`);
      const getData = await getResponse.json();
      
      console.log('📋 Lista d\'attesa per', testData.customerEmail);
      console.log(JSON.stringify(getData, null, 2));
      
      // Cleanup - rimuove l'entry di test
      if (getData.waitlist && getData.waitlist.length > 0) {
        const waitlistId = getData.waitlist[0].id;
        console.log('\n🧹 Cleanup: rimuovo entry di test...');
        
        const deleteResponse = await fetch(`http://localhost:3001/api/waitlist?id=${waitlistId}&user_email=${encodeURIComponent(testData.customerEmail)}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log('✅ Entry di test rimossa');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
    console.error(error.stack);
  }
}

testWaitlistAPI();
