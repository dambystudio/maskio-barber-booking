#!/usr/bin/env node

console.log('🧪 Testing date generation and formatting fix\n');

// Simulate the old problematic method
function oldDateGeneration() {
    console.log('❌ OLD METHOD (problematic):');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const oldDateString = date.toISOString().split('T')[0]; // This causes timezone issues
        console.log(`Day ${i}: Local date: ${date.toDateString()}, Generated string: ${oldDateString}`);
    }
    console.log();
}

// Simulate the new fixed method
function newDateGeneration() {
    console.log('✅ NEW METHOD (fixed):');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Fixed method - manual formatting without timezone conversion
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const newDateString = `${year}-${month}-${day}`;
        
        console.log(`Day ${i}: Local date: ${date.toDateString()}, Generated string: ${newDateString}`);
    }
    console.log();
}

// Test date formatting function
function testDateFormatting() {
    console.log('🎯 Testing date formatting function:');
    
    const testDate = '2025-06-09'; // Monday June 9th
    
    // Old problematic method (what was happening before)
    const oldFormattedDate = new Date(testDate).toLocaleDateString('it-IT', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // New fixed method
    const [year, month, day] = testDate.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const newFormattedDate = `${dayNames[date.getUTCDay()]} ${date.getUTCDate()} ${monthNames[date.getUTCMonth()]}`;
    
    console.log(`Selected date string: ${testDate}`);
    console.log(`❌ Old formatting result: ${oldFormattedDate}`);
    console.log(`✅ New formatting result: ${newFormattedDate}`);
    console.log();
}

// Test server date parsing
function testServerDateParsing() {
    console.log('🔧 Testing server date parsing:');
    
    const testDate = '2025-06-09'; // Monday June 9th
    
    // Old problematic server method
    const oldServerDate = new Date(testDate);
    console.log(`❌ Old server parsing: new Date('${testDate}') = ${oldServerDate.toDateString()} (day: ${oldServerDate.getDay()})`);
    
    // New fixed server method
    const [year, month, day] = testDate.split('-').map(Number);
    const newServerDate = new Date(year, month - 1, day);
    console.log(`✅ New server parsing: manual parsing = ${newServerDate.toDateString()} (day: ${newServerDate.getDay()})`);
    console.log();
}

// Run all tests
oldDateGeneration();
newDateGeneration();
testDateFormatting();
testServerDateParsing();

console.log('🎉 Date fix testing completed!');
console.log('✨ The new method should consistently show the correct day without timezone issues.');
