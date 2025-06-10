// Test script per verificare le recensioni Google
import fetch from 'node-fetch';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE_ID = process.env.GOOGLE_PLACE_ID;

async function testGoogleReviews() {
  console.log('🔍 Testing Google Reviews API...\n');
  
  if (!GOOGLE_API_KEY) {
    console.log('❌ GOOGLE_PLACES_API_KEY non configurata');
    console.log('💡 Aggiungi GOOGLE_PLACES_API_KEY=... al file .env.local');
    return;
  }
  
  if (!PLACE_ID) {
    console.log('❌ GOOGLE_PLACE_ID non configurato');
    console.log('💡 Aggiungi GOOGLE_PLACE_ID=... al file .env.local');
    return;
  }
  
  console.log('✅ Configurazione trovata:');
  console.log(`🔑 API Key: ${GOOGLE_API_KEY.substring(0, 10)}...`);
  console.log(`📍 Place ID: ${PLACE_ID}`);
  console.log('');
  
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,reviews,user_ratings_total&key=${GOOGLE_API_KEY}`;
    
    console.log('🌐 Calling Google Places API...');
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.log('❌ Errore API:', data.status);
      console.log('📄 Response:', data);
      return;
    }
    
    const place = data.result;
    console.log('✅ Dati attività trovati:');
    console.log(`📍 Nome: ${place.name}`);
    console.log(`⭐ Rating: ${place.rating}/5`);
    console.log(`📊 Totale recensioni: ${place.user_ratings_total}`);
    console.log('');
    
    if (place.reviews && place.reviews.length > 0) {
      console.log('📝 Recensioni trovate:');
      place.reviews.forEach((review, index) => {
        console.log(`\n${index + 1}. ${review.author_name}`);
        console.log(`   ⭐ ${review.rating}/5`);
        console.log(`   📅 ${new Date(review.time * 1000).toLocaleDateString('it-IT')}`);
        console.log(`   💬 ${review.text.substring(0, 100)}${review.text.length > 100 ? '...' : ''}`);
      });
    } else {
      console.log('❌ Nessuna recensione trovata');
      console.log('💡 Verifica che il Place ID sia corretto');
    }
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error.message);
  }
}

testGoogleReviews();
