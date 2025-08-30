#!/usr/bin/env node

/**
 * Script per configurare le variabili VAPID su Vercel
 * Esegui: node setup-vercel-vapid.mjs
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

console.log('🔧 Configurazione VAPID Keys su Vercel...\n');

try {
  // Leggi le chiavi dal file .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  
  // Estrai le chiavi VAPID
  const vapidPublicMatch = envContent.match(/NEXT_PUBLIC_VAPID_PUBLIC_KEY="([^"]+)"/);
  const vapidPrivateMatch = envContent.match(/VAPID_PRIVATE_KEY="([^"]+)"/);
  const vapidEmailMatch = envContent.match(/VAPID_EMAIL="([^"]+)"/);
  
  if (!vapidPublicMatch || !vapidPrivateMatch || !vapidEmailMatch) {
    throw new Error('Chiavi VAPID non trovate nel file .env.local');
  }
  
  const vapidPublic = vapidPublicMatch[1];
  const vapidPrivate = vapidPrivateMatch[1];
  const vapidEmail = vapidEmailMatch[1];
  
  console.log('✅ Chiavi VAPID trovate nel file locale');
  console.log(`📧 Email: ${vapidEmail}`);
  console.log(`🔑 Public Key: ${vapidPublic.substring(0, 20)}...`);
  console.log(`🔐 Private Key: ${vapidPrivate.substring(0, 20)}...\n`);
  
  // Comandi Vercel per impostare le variabili
  const commands = [
    `vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY production`,
    `vercel env add VAPID_PRIVATE_KEY production`, 
    `vercel env add VAPID_EMAIL production`
  ];
  
  console.log('📋 Comandi da eseguire per configurare Vercel:');
  console.log('');
  
  commands.forEach((cmd, index) => {
    console.log(`${index + 1}. ${cmd}`);
  });
  
  console.log('');
  console.log('💡 Per configurare automaticamente, esegui:');
  console.log('');
  console.log(`echo "${vapidPublic}" | vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY production`);
  console.log(`echo "${vapidPrivate}" | vercel env add VAPID_PRIVATE_KEY production`);
  console.log(`echo "${vapidEmail}" | vercel env add VAPID_EMAIL production`);
  console.log('');
  console.log('🔄 Dopo aver configurato, fai un nuovo deploy:');
  console.log('git commit --allow-empty -m "trigger redeploy for VAPID config"');
  console.log('git push origin main');
  console.log('');
  console.log('🧪 Poi testa con: https://www.maskiobarberconcept.it/api/debug/vapid-check');

} catch (error) {
  console.error('❌ Errore:', error.message);
  process.exit(1);
}
