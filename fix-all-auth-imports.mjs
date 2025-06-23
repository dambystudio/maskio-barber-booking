import fs from 'fs';
import path from 'path';

const filesToFix = [
  'src/app/api/admin/users/route.ts',
  'src/app/api/admin/database-status/route.ts',
  'src/app/api/admin/database-cleanup/route.ts',
  'src/app/api/admin/promote-user/route.ts',
  'src/app/api/admin/role-config/route.ts',
  'src/app/api/admin/manage-roles/route.ts',
  'src/app/api/user/update-phone/route.ts',
  'src/app/api/auth/verify-email/route.ts',
  'src/app/api/auth/verify/route.ts'
];

async function fixAuthImports() {
  console.log('🔧 Fixing auth imports in API routes...\n');
  
  for (const filePath of filesToFix) {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        continue;
      }
      
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Check if file has the problematic import
      if (content.includes("import { auth } from '@/lib/auth';")) {
        console.log(`🔧 Fixing: ${filePath}`);
        
        // Replace the import
        content = content.replace(
          "import { auth } from '@/lib/auth';",
          "import { getServerSession } from 'next-auth';\nimport { authOptions } from '@/lib/auth';"
        );
        
        // Replace the function call
        content = content.replace(
          /const session = await auth\(\);/g,
          'const session = await getServerSession(authOptions);'
        );
        
        // Also check for other variations
        content = content.replace(
          /await auth\(\)/g,
          'await getServerSession(authOptions)'
        );
        
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
      } else {
        console.log(`✅ Already correct: ${filePath}`);
      }
      
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  }
  
  console.log('\n🎉 Auth imports fix completed!');
  console.log('🔍 All API routes should now use getServerSession instead of auth()');
}

// Run the fix
fixAuthImports();
