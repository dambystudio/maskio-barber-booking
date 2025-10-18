import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testAPIDirectly() {
    console.log('\n🧪 TEST API BATCH-AVAILABILITY DIRETTAMENTE');
    console.log('='.repeat(80));
    
    const micheleEmail = 'michelebiancofiore0230@gmail.com';
    const testDate = '2025-10-30';
    
    try {
        // Get Michele ID
        const michele = await sql`
            SELECT id FROM barbers WHERE email = ${micheleEmail}
        `;
        
        if (michele.length === 0) {
            console.log('❌ Michele non trovato');
            return;
        }
        
        const barberId = michele[0].id;
        
        // Test with localhost API
        console.log('\n🌐 Chiamata API localhost:3000...\n');
        
        const apiUrl = 'http://localhost:3000/api/bookings/batch-availability';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                barberId: barberId,
                dates: [testDate, '2025-10-31', '2025-11-01']
            })
        });
        
        if (!response.ok) {
            console.log(`❌ API Error: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.log('Error:', errorText);
            
            console.log('\n⚠️ Server probabilmente non in esecuzione');
            console.log('💡 Avvia il server: npm run dev');
            return;
        }
        
        const data = await response.json();
        
        console.log('✅ Risposta API ricevuta:\n');
        console.log(JSON.stringify(data, null, 2));
        
        // Check October 30 specifically
        if (data.availability && data.availability[testDate]) {
            const oct30 = data.availability[testDate];
            
            console.log('\n' + '='.repeat(80));
            console.log(`📊 RISULTATO PER ${testDate}:`);
            console.log('='.repeat(80));
            console.log(`   hasSlots: ${oct30.hasSlots ? '✅ TRUE' : '❌ FALSE'}`);
            console.log(`   availableCount: ${oct30.availableCount}`);
            console.log(`   totalSlots: ${oct30.totalSlots}`);
            
            if (oct30.hasSlots) {
                console.log('\n✅ API RITORNA CORRETTAMENTE hasSlots=TRUE');
                console.log('✅ Il problema è nel FRONTEND');
            } else {
                console.log('\n❌ API RITORNA hasSlots=FALSE');
                console.log('❌ Il problema è nell\'API');
            }
        }
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('\n❌ ERRORE: Server non raggiungibile');
            console.log('\n💡 SOLUZIONE:');
            console.log('   1. Apri un nuovo terminale');
            console.log('   2. Esegui: npm run dev');
            console.log('   3. Attendi che il server si avvii');
            console.log('   4. Riprova questo script');
        } else {
            console.error('\n❌ ERRORE:', error.message);
        }
    }
}

testAPIDirectly()
    .then(() => {
        console.log('\n✅ Test completato\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test fallito:', error);
        process.exit(1);
    });
