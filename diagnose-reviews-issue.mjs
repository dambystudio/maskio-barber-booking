#!/usr/bin/env node

/**
 * Test diagnostico per Google Reviews API
 * Identifica perché le recensioni a volte non vengono mostrate
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carica environment variables
config({ path: join(__dirname, '.env.local') });

console.log('🔍 DIAGNOSI GOOGLE REVIEWS API\n');

// Test 1: Verifica Environment Variables
console.log('1️⃣ Environment Variables:');
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE_ID = process.env.GOOGLE_PLACE_ID;

console.log(`   API Key presente: ${!!API_KEY ? '✅' : '❌'}`);
console.log(`   Place ID presente: ${!!PLACE_ID ? '✅' : '❌'}`);

if (API_KEY) {
  console.log(`   API Key (primi 20 char): ${API_KEY.substring(0, 20)}...`);
}
if (PLACE_ID) {
  console.log(`   Place ID: ${PLACE_ID}`);
}

// Test 2: Chiamata diretta API Google Places
console.log('\n2️⃣ Test API Google Places:');

if (!API_KEY || !PLACE_ID) {
  console.log('   ❌ Configurazione mancante - Mostra dati mock');
  process.exit(0);
}

try {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,reviews,user_ratings_total&key=${API_KEY}&language=it`;
  
  console.log('   🌐 Calling Google Places API...');
  console.log(`   URL: ${url.replace(API_KEY, 'API_KEY_HIDDEN')}`);
  
  const response = await fetch(url);
  const data = await response.json();
  
  console.log(`   📊 Response Status: ${response.status}`);
  console.log(`   📊 API Status: ${data.status}`);
  
  if (data.status !== 'OK') {
    console.log('   ❌ API Error Details:');
    console.log('   ', JSON.stringify(data, null, 2));
    
    // Analizza errori comuni
    switch(data.status) {
      case 'REQUEST_DENIED':
        console.log('\n   🚨 POSSIBILI CAUSE:');
        console.log('   - API Key non valida');
        console.log('   - Places API non abilitato');
        console.log('   - Restrizioni API Key troppo severe');
        break;
      case 'INVALID_REQUEST':
        console.log('\n   🚨 POSSIBILI CAUSE:');
        console.log('   - Place ID non valido');
        console.log('   - Parametri richiesta errati');
        break;
      case 'OVER_QUERY_LIMIT':
        console.log('\n   🚨 POSSIBILI CAUSE:');
        console.log('   - Quota API esaurita');
        console.log('   - Tropppe richieste al minuto');
        break;
      case 'ZERO_RESULTS':
        console.log('\n   🚨 POSSIBILI CAUSE:');
        console.log('   - Place ID non trovato');
        console.log('   - Nessuna recensione disponibile');
        break;
    }
    process.exit(1);
  }
  
  // Analizza i risultati
  console.log('\n3️⃣ Analisi Risultati:');
  console.log(`   Nome attività: ${data.result.name || 'N/A'}`);
  console.log(`   Rating medio: ${data.result.rating || 'N/A'}`);
  console.log(`   Totale recensioni: ${data.result.user_ratings_total || 'N/A'}`);
  console.log(`   Recensioni nell'API: ${data.result.reviews?.length || 0}`);
  
  if (data.result.reviews && data.result.reviews.length > 0) {
    console.log('\n   📝 Recensioni disponibili:');
    data.result.reviews.forEach((review, index) => {
      console.log(`   ${index + 1}. ${review.author_name} (${review.rating}⭐)`);
      console.log(`      "${review.text.substring(0, 100)}..."`);
      console.log(`      Tempo: ${review.relative_time_description}`);
    });
  } else {
    console.log('\n   ⚠️  NESSUNA RECENSIONE DISPONIBILE');
    console.log('   🚨 POSSIBILI CAUSE:');
    console.log('   - Google non ha recensioni per questo Place ID');
    console.log('   - Recensioni private/nascoste');
    console.log('   - Place ID si riferisce a luogo senza recensioni');
  }
  
  // Test 4: Verifica consistenza
  console.log('\n4️⃣ Test Consistenza (5 chiamate):');
  const results = [];
  
  for (let i = 0; i < 5; i++) {
    try {
      const testResponse = await fetch(url);
      const testData = await testResponse.json();
      results.push({
        status: testData.status,
        reviewCount: testData.result?.reviews?.length || 0,
        rating: testData.result?.rating || 0
      });
      
      // Piccola pausa tra le chiamate
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      results.push({
        status: 'ERROR',
        error: error.message
      });
    }
  }
  
  console.log('   Risultati:');
  results.forEach((result, index) => {
    console.log(`   ${index + 1}. Status: ${result.status}, Reviews: ${result.reviewCount}, Rating: ${result.rating}`);
  });
  
  // Analizza consistenza
  const statuses = results.map(r => r.status);
  const reviewCounts = results.map(r => r.reviewCount).filter(c => c !== undefined);
  const uniqueStatuses = [...new Set(statuses)];
  const uniqueReviewCounts = [...new Set(reviewCounts)];
  
  console.log('\n5️⃣ Diagnosi Finale:');
  
  if (uniqueStatuses.length === 1 && uniqueStatuses[0] === 'OK') {
    console.log('   ✅ API funziona consistentemente');
  } else {
    console.log('   ❌ API inconsistente - Statuses:', uniqueStatuses);
  }
  
  if (uniqueReviewCounts.length === 1) {
    console.log(`   ✅ Numero recensioni consistente: ${uniqueReviewCounts[0]}`);
  } else {
    console.log('   ❌ Numero recensioni variabile:', uniqueReviewCounts);
  }
  
  if (reviewCounts.some(c => c === 0)) {
    console.log('\n   🚨 PROBLEMA IDENTIFICATO:');
    console.log('   - A volte la risposta ha 0 recensioni');
    console.log('   - Questo spiega perché la sezione appare vuota');
    console.log('\n   💡 SOLUZIONI:');
    console.log('   1. Implementare retry logic');
    console.log('   2. Cache delle recensioni');
    console.log('   3. Fallback a dati mock se necessario');
  }
  
} catch (error) {
  console.error('\n❌ Errore durante il test:', error.message);
}

console.log('\n🔧 RACCOMANDAZIONI:');
console.log('1. Implementare caching delle recensioni');
console.log('2. Aggiungere retry logic in caso di errore');
console.log('3. Monitorare quota API Google');
console.log('4. Implementare fallback a dati mock più robusto');
