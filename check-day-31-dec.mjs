#!/usr/bin/env node

const date = new Date('2024-12-31');
const dayOfWeek = date.getDay();
const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

console.log(`31 Dicembre 2024 è: ${days[dayOfWeek]} (day ${dayOfWeek})`);
