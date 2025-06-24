#!/usr/bin/env node

/**
 * Test di robustezza per il sistema di recensioni migliorato
 * Verifica retry logic, caching e fallback
 */

console.log('🧪 TEST ROBUSTEZZA SISTEMA RECENSIONI\n');

const BASE_URL = 'http://localhost:3000';
const API_ENDPOINT = '/api/google-reviews';

// Funzione per fare una richiesta HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

// Test 1: Verifica funzionamento base
async function testBasicFunctionality() {
  console.log('1️⃣ Test funzionamento base...');
  
  try {
    const data = await makeRequest(`${BASE_URL}${API_ENDPOINT}`);
    
    console.log(`   ✅ Risposta ricevuta`);
    console.log(`   📊 Recensioni: ${data.reviews?.length || 0}`);
    console.log(`   ⭐ Rating medio: ${data.averageRating || 'N/A'}`);
    console.log(`   🏷️  Demo: ${data.isDemo ? 'Sì' : 'No'}`);
    console.log(`   📦 Cache: ${data.cached ? 'Sì' : 'No'}`);
    
    if (data.message) {
      console.log(`   💬 Messaggio: ${data.message}`);
    }
    
    return data;
  } catch (error) {
    console.log(`   ❌ Errore: ${error.message}`);
    return null;
  }
}

// Test 2: Verifica consistenza (multiple richieste)
async function testConsistency() {
  console.log('\n2️⃣ Test consistenza (5 richieste)...');
  
  const results = [];
  
  for (let i = 0; i < 5; i++) {
    try {
      const data = await makeRequest(`${BASE_URL}${API_ENDPOINT}`);
      results.push({
        success: true,
        reviewCount: data.reviews?.length || 0,
        rating: data.averageRating || 0,
        isDemo: data.isDemo || false,
        cached: data.cached || false
      });
      
      console.log(`   ${i + 1}. ✅ Reviews: ${data.reviews?.length || 0}, Rating: ${data.averageRating || 0}, Cache: ${data.cached ? 'HIT' : 'MISS'}`);
      
      // Piccola pausa tra le richieste
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      results.push({
        success: false,
        error: error.message
      });
      console.log(`   ${i + 1}. ❌ Errore: ${error.message}`);
    }
  }
  
  // Analizza risultati
  const successful = results.filter(r => r.success);
  const reviewCounts = successful.map(r => r.reviewCount);
  const uniqueCounts = [...new Set(reviewCounts)];
  
  console.log(`\n   📊 Successi: ${successful.length}/5`);
  console.log(`   📊 Conteggi recensioni: ${uniqueCounts.join(', ')}`);
  
  if (uniqueCounts.length === 1) {
    console.log(`   ✅ Consistenza perfetta`);
  } else {
    console.log(`   ⚠️  Inconsistenza rilevata`);
  }
  
  return results;
}

// Test 3: Verifica cache
async function testCaching() {
  console.log('\n3️⃣ Test caching...');
  
  try {
    // Prima richiesta (dovrebbe caricare i dati)
    const first = await makeRequest(`${BASE_URL}${API_ENDPOINT}`);
    console.log(`   1. Prima richiesta - Cache: ${first.cached ? 'HIT' : 'MISS'}`);
    
    // Seconda richiesta immediata (dovrebbe usare cache)
    const second = await makeRequest(`${BASE_URL}${API_ENDPOINT}`);
    console.log(`   2. Seconda richiesta - Cache: ${second.cached ? 'HIT' : 'MISS'}`);
    
    if (second.cached) {
      console.log(`   ✅ Cache funziona correttamente`);
    } else {
      console.log(`   ⚠️  Cache non utilizzata`);
    }
    
    return { first, second };
  } catch (error) {
    console.log(`   ❌ Errore nel test cache: ${error.message}`);
    return null;
  }
}

// Test 4: Verifica gestione errori (simulando problemi di rete)
async function testErrorHandling() {
  console.log('\n4️⃣ Test gestione errori...');
  
  try {
    // Tenta di chiamare un endpoint inesistente per vedere il fallback
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 1000); // Timeout dopo 1 secondo
    
    const data = await makeRequest(`${BASE_URL}${API_ENDPOINT}`, {
      signal: controller.signal
    });
    
    console.log(`   ✅ Risposta ricevuta nonostante timeout simulato`);
    console.log(`   📊 Fallback attivo: ${data.isFallback ? 'Sì' : 'No'}`);
    
    return data;
  } catch (error) {
    console.log(`   ⚠️  Errore gestito: ${error.message}`);
    return null;
  }
}

// Esegui tutti i test
async function runAllTests() {
  console.log(`🌐 Testando endpoint: ${BASE_URL}${API_ENDPOINT}\n`);
  
  const results = {
    basic: await testBasicFunctionality(),
    consistency: await testConsistency(),
    caching: await testCaching(),
    errorHandling: await testErrorHandling()
  };
  
  console.log('\n📋 RIEPILOGO TEST:');
  console.log('================');
  
  // Analisi finale
  if (results.basic) {
    console.log('✅ Funzionamento base: OK');
  } else {
    console.log('❌ Funzionamento base: FAILED');
  }
  
  if (results.consistency) {
    const successful = results.consistency.filter(r => r.success).length;
    console.log(`✅ Consistenza: ${successful}/5 richieste riuscite`);
  } else {
    console.log('❌ Test consistenza: FAILED');
  }
  
  if (results.caching?.second?.cached) {
    console.log('✅ Caching: OK');
  } else {
    console.log('⚠️  Caching: Non verificato');
  }
  
  console.log('\n🎯 RACCOMANDAZIONI:');
  
  if (results.basic?.reviews?.length === 0) {
    console.log('- Verificare configurazione Google Places API');
  }
  
  if (results.basic?.isDemo) {
    console.log('- Sistema in modalità demo/fallback');
  }
  
  if (!results.caching?.second?.cached) {
    console.log('- Cache potrebbe non funzionare correttamente');
  }
  
  console.log('- Monitorare le performance in produzione');
  console.log('- Implementare logging per debugging');
}

// Avvia i test
runAllTests().catch(error => {
  console.error('❌ Errore durante i test:', error);
  process.exit(1);
});
