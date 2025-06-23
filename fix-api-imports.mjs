import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to fix - all API endpoints
const filesToFix = [
  'src/app/api/user/update-phone/route.ts',
  'src/app/api/closure-settings/route.ts',
  'src/app/api/admin/role-config/route.ts',
  'src/app/api/admin/promote-user/route.ts',
  'src/app/api/admin/manage-roles/route.ts',
  'src/app/api/admin/database-status/route.ts'
];

console.log('🔧 Fixing remaining API endpoints to use correct auth import...');

for (const filePath of filesToFix) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    continue;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace auth.config imports with auth
    content = content.replace(
      /import { authOptions } from ['"]@\/lib\/auth\.config['"];?\n/g,
      ''
    );
    content = content.replace(
      /import { authOptions } from ['"].*\/auth\.config['"];?\n/g,
      ''
    );
    
    // Add auth import if not present
    if (!content.includes("import { auth }")) {
      content = content.replace(
        /import { NextRequest, NextResponse } from ['"]next\/server['"];?\n/,
        "import { NextRequest, NextResponse } from 'next/server';\nimport { auth } from '@/lib/auth';\n"
      );
    }
    
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed: ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log('🎉 API endpoints import fix completed!');
