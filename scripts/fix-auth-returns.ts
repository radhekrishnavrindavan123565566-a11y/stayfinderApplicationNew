/**
 * Automatically fix missing return statements in auth checks
 */

import fs from 'fs';
import path from 'path';

let fixedCount = 0;

function fixFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let modified = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line has a null check without return
    if ((line.includes('if (!user)') || line.includes('if(!user)') || 
         line.includes('if (!authUser)') || line.includes('if(!authUser)')) &&
        !line.includes('return')) {
      
      // Check next line
      const nextLine = lines[i + 1] || '';
      
      // If next line has errorResponse but no return, add return
      if (nextLine.includes('errorResponse') && !nextLine.includes('return')) {
        lines[i + 1] = nextLine.replace('errorResponse', 'return errorResponse');
        modified = true;
        fixedCount++;
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    const relativePath = filePath.replace(process.cwd(), '');
    console.log(`✓ Fixed: ${relativePath}`);
  }
}

function scanDirectory(dir: string) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file === 'route.ts') {
      fixFile(filePath);
    }
  }
}

console.log('\n🔧 Fixing missing return statements in auth checks...\n');

const apiDir = path.join(process.cwd(), 'app', 'api');
scanDirectory(apiDir);

console.log(`\n✅ Fixed ${fixedCount} files\n`);
