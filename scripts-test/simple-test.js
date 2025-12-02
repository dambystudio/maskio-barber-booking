console.log('Starting simple test...');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL starts with postgres:', process.env.DATABASE_URL?.startsWith('postgres'));
console.log('Node.js version:', process.version);
console.log('Test completed!');
