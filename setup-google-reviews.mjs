// Script per configurare e testare Google Reviews API
import { config } from 'dotenv';
config({ path: '.env.local' });

const PLACE_ID = process.env.GOOGLE_PLACE_ID;
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

console.log('🔧 SETUP GOOGLE REVIEWS - Maskio Barber\n');

// Controlla se abbiamo il Place ID
if (!PLACE_ID || PLACE_ID === 'your-business-place-id-here') {
  console.log('❌ Place ID non configurato!');
  process.exit(1);
}

console.log('✅ Place ID configurato:', PLACE_ID);

// Controlla se abbiamo l'API Key
if (!API_KEY || API_KEY === 'your-google-places-api-key-here') {
  console.log('\n📋 PROSSIMI PASSI:');
  console.log('1. 🌐 Vai su Google Cloud Console: https://console.cloud.google.com/');
  console.log('2. 📊 Crea un nuovo progetto o seleziona uno esistente');
  console.log('3. 🔌 Abilita "Places API" nella libreria API');
  console.log('4. 💳 Configura il billing (richiesto anche per piano gratuito)');
  console.log('5. 🔑 Crea una API Key in "Credenziali"');
  console.log('6. 📝 Copia la API Key nel file .env.local');
  console.log('\n💡 CONSIGLIO: Usa il TUO account Google per configurare tutto!');
  console.log('   Il barbiere deve solo dare accesso al My Business.');
  
  process.exit(0);
}

// Test API Key
console.log('\n🧪 Testando API Key...');

async function testGooglePlacesAPI() {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,reviews,formatted_address,formatted_phone_number&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK') {
      console.log('✅ API Funziona!');
      console.log('🏪 Nome attività:', data.result.name);
      console.log('📍 Indirizzo:', data.result.formatted_address);
      console.log('📞 Telefono:', data.result.formatted_phone_number || 'Non disponibile');
      console.log('⭐ Rating:', data.result.rating || 'Non disponibile');
      
      if (data.result.reviews && data.result.reviews.length > 0) {
        console.log(`\n📝 Recensioni trovate: ${data.result.reviews.length}`);
        console.log('Ultima recensione:');
        const lastReview = data.result.reviews[0];
        console.log(`  👤 ${lastReview.author_name}`);
        console.log(`  ⭐ ${lastReview.rating}/5`);
        console.log(`  💬 "${lastReview.text.substring(0, 100)}..."`);
      } else {
        console.log('\n⚠️ Nessuna recensione trovata o non accessibile via API');
      }
      
    } else {
      console.log('❌ Errore API:', data.status);
      console.log('📄 Dettagli:', data.error_message || 'Errore sconosciuto');
      
      if (data.status === 'REQUEST_DENIED') {
        console.log('\n🔧 POSSIBILI SOLUZIONI:');
        console.log('1. Verifica che Places API sia abilitata');
        console.log('2. Controlla che il billing sia configurato');
        console.log('3. Verifica che l\'API Key sia corretta');
        console.log('4. Controlla le restrizioni dell\'API Key');
      }
    }
    
  } catch (error) {
    console.log('❌ Errore di rete:', error.message);
  }
}

await testGooglePlacesAPI();

console.log('\n📚 RISORSE UTILI:');
console.log('- Google Cloud Console: https://console.cloud.google.com/');
console.log('- Places API Docs: https://developers.google.com/maps/documentation/places/web-service');
console.log('- API Key Restrictions: https://cloud.google.com/docs/authentication/api-keys');
