#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

await sql`UPDATE waitlist SET status = 'waiting' WHERE date = '2025-12-05' AND barber_id = 'fabio'`;
console.log('✅ Status resettato a "waiting"');
