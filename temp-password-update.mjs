#!/usr/bin/env node

import bcrypt from 'bcryptjs';

console.log('🔒 Generazione hash per password "ziopera"');

const password = 'ziopera';
const hashedPassword = await bcrypt.hash(password, 12);

console.log('✅ Password:', password);
console.log('� Hash generato:', hashedPassword);
console.log('\n� Copia questo hash nel database:');
console.log(hashedPassword);
