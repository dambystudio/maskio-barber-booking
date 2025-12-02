const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function findPlaceId() {
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!API_KEY) {
    console.error('❌ API Key non trovata nel file .env.local');
    return;
  }

  console.log('🔍 Cercando "Maskio Barber Concept" a San Giovanni Rotondo...');
  
  // Query di ricerca
  const query = 'Maskio Barber Concept Via Sant\'Agata 24 San Giovanni Rotondo';
  const encodedQuery = encodeURIComponent(query);
  
  // URL per Text Search API
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&key=${API_KEY}&language=it`;
  
  try {
    console.log('🌐 Chiamando Google Places Text Search API...');
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('📊 Status:', data.status);
    
    if (data.status === 'OK' && data.results.length > 0) {
      console.log(`\n✅ Trovati ${data.results.length} risultati:\n`);
      
      data.results.forEach((place, index) => {
        console.log(`--- Risultato ${index + 1} ---`);
        console.log('📍 Place ID:', place.place_id);
        console.log('🏪 Nome:', place.name);
        console.log('📧 Indirizzo:', place.formatted_address);
        console.log('⭐ Rating:', place.rating || 'N/A');
        console.log('💬 Total reviews:', place.user_ratings_total || 'N/A');
        console.log('🏷️ Tipi:', place.types.slice(0, 3).join(', '));
        console.log('');
      });
      
      const bestMatch = data.results[0];
      console.log('🎯 PLACE ID DA USARE:', bestMatch.place_id);
      console.log('\n📝 Aggiorna il file .env.local con:');
      console.log(`GOOGLE_PLACE_ID=${bestMatch.place_id}`);
      
    } else if (data.status === 'ZERO_RESULTS') {
      console.log('❌ Nessun risultato trovato. Prova con una ricerca più generica...');
      
      // Ricerca di backup più generica
      const backupQuery = 'Maskio Barber San Giovanni Rotondo';
      const backupUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(backupQuery)}&key=${API_KEY}&language=it`;
      
      console.log('🔄 Provo ricerca di backup:', backupQuery);
      const backupResponse = await fetch(backupUrl);
      const backupData = await backupResponse.json();
      
      if (backupData.results.length > 0) {
        console.log('\n✅ Risultati ricerca di backup:');
        backupData.results.forEach((place, index) => {
          console.log(`${index + 1}. ${place.name} - ${place.formatted_address}`);
          console.log(`   Place ID: ${place.place_id}`);
        });
      }
      
    } else {
      console.error('❌ Errore API:', data.status);
      console.error('Messaggio:', data.error_message || 'Errore sconosciuto');
    }
    
  } catch (error) {
    console.error('❌ Errore nella richiesta:', error.message);
  }
}

findPlaceId();
