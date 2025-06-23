// Script per aggiornare tutte le email di Michele nei file di test e script
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const OLD_EMAIL = 'michelebiancofiore0230@gmail.com';
const NEW_EMAIL = 'michelebiancofiore0230@gmail.com';

function updateFilesInDirectory(dir) {
    const files = readdirSync(dir);
    let updatedFiles = [];
    
    for (const file of files) {
        const filePath = join(dir, file);
        const stat = statSync(filePath);
        
        if (stat.isDirectory()) {
            // Skip node_modules, .git, .next
            if (['node_modules', '.git', '.next', 'dist', 'build'].includes(file)) {
                continue;
            }
            updatedFiles = updatedFiles.concat(updateFilesInDirectory(filePath));
        } else if (file.endsWith('.mjs') || file.endsWith('.js') || file.endsWith('.md')) {
            try {
                const content = readFileSync(filePath, 'utf8');
                if (content.includes(OLD_EMAIL)) {
                    const newContent = content.replaceAll(OLD_EMAIL, NEW_EMAIL);
                    writeFileSync(filePath, newContent, 'utf8');
                    updatedFiles.push(filePath);
                    console.log(`✅ Updated: ${filePath}`);
                }
            } catch (error) {
                console.log(`⚠️ Skipped: ${filePath} (${error.message})`);
            }
        }
    }
    
    return updatedFiles;
}

console.log(`🔄 Updating Michele's email from ${OLD_EMAIL} to ${NEW_EMAIL}...`);
console.log('📁 Scanning files...\n');

const updatedFiles = updateFilesInDirectory('.');

console.log(`\n📊 Summary:`);
console.log(`- Files updated: ${updatedFiles.length}`);
console.log(`- Old email: ${OLD_EMAIL}`);
console.log(`- New email: ${NEW_EMAIL}`);

if (updatedFiles.length > 0) {
    console.log('\n📝 Updated files:');
    updatedFiles.forEach(file => console.log(`  - ${file}`));
} else {
    console.log('\n✅ No files needed updating - all already correct!');
}
