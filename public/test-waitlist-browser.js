/**
 * Script per testare notifica - DA ESEGUIRE DAL BROWSER
 * 
 * 1. Apri la console del browser (F12)
 * 2. Vai su https://dominical-kenneth-gasifiable.ngrok-free.dev
 * 3. Fai login con test@gmail.com
 * 4. Copia e incolla questo script nella console
 */

async function testWaitlistNotification() {
  console.log('📤 Test Notifica Waitlist\n');
  
  const payload = {
    userId: 'a6b2f763-48bd-4605-8b46-df27a6ebca42', // Account Test
    notification: {
      title: '🎉 Posto Disponibile!',
      body: 'Michele è libero il 5 dicembre alle 10:00. Prenota entro 15 minuti!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'waitlist-michele-2025-12-05',
      data: {
        url: '/prenota?barber=michele&date=2025-12-05&time=10:00',
        type: 'waitlist_slot_available',
        barberId: 'michele',
        date: '2025-12-05',
        time: '10:00'
      },
      actions: [
        { action: 'book', title: '📅 Prenota' },
        { action: 'dismiss', title: 'Ignora' }
      ],
      requireInteraction: true
    }
  };
  
  try {
    const response = await fetch('/api/push/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    console.log(`📊 Risposta (${response.status}):`, result);
    
    if (response.ok) {
      console.log('✅ NOTIFICA INVIATA!');
      console.log('📱 Controlla il tuo dispositivo!');
      console.log('🔍 Cerca anche "[SW-PUSH]" in questa console');
    } else {
      console.error('❌ Errore:', result);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

// Esegui
testWaitlistNotification();
