// Script per generare chiavi VAPID per le notifiche push
import webPush from 'web-push';

console.log('🔑 Generazione chiavi VAPID...\n');

const vapidKeys = webPush.generateVAPIDKeys();

console.log('✅ Chiavi VAPID generate:');
console.log('📋 Aggiungi queste al tuo .env.local:\n');
console.log(`VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`);
console.log(`VAPID_EMAIL="davide431@outlook.it"`);
console.log('\n🔒 ATTENZIONE: Tieni private queste chiavi!');
