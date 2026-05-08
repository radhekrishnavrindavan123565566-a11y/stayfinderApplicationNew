/**
 * Fix Missing errorResponse Imports
 * Automatically adds missing errorResponse imports to API routes
 */

import fs from 'fs';
import path from 'path';

let fixedCount = 0;

function fixFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if file uses errorResponse but doesn't import it
  if (content.includes('errorResponse') && !content.includes('import.*errorResponse')) {
    const lines = content.split('\n');
    let modified = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Find the apiResponse import line
      if (line.includes('from "@/lib/apiResponse"') && !line.includes('errorResponse')) {
        // Add errorResponse to the import
        if (line.includes('successResponse')) {
          lines[i] = line.replace('successResponse', 'successResponse, errorResponse');
          modified = true;
          fixedCount++;
          break;
        } else if (line.includes('handleApiError')) {
          lines[i] = line.replace('handleApiError', 'errorResponse, handleApiError');
          modified = true;
          fixedCount++;
          break;
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
      const relativePath = filePath.replace(process.cwd(), '');
      console.log(`✓ Fixed: ${relativePath}`);
    }
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

console.log('\n🔧 Fixing missing errorResponse imports...\n');

const apiDir = path.join(process.cwd(), 'app', 'api');
scanDirectory(apiDir);

console.log(`\n✅ Fixed ${fixedCount} files\n`);
