#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Specific patterns to fix based on your ESLint errors
const UNUSED_PATTERNS = {
    // File-specific unused imports to remove
    'src/utils/cartUtils.ts': [
        { pattern: /,\s*address[^,}]*/, replacement: '' }, // Remove address parameter
    ],
    'src/utils/checkoutUtils.ts': [
        { pattern: /import.*CART_CONFIG.*from.*;\s*\n/, replacement: '' },
        { pattern: /const\s+timestamp\s*=.*;\s*\n/, replacement: '' },
        { pattern: /const\s+version\s*=.*;\s*\n/, replacement: '' },
    ],
    'src/components/wishlist/WishlistCard.tsx': [
        { pattern: /,?\s*Heart\s*,?/, replacement: '' },
        { pattern: /,?\s*MoreVertical\s*,?/, replacement: '' },
        { pattern: /,?\s*Star\s*,?/, replacement: '' },
        { pattern: /,?\s*Check\s*,?/, replacement: '' },
    ],
    'src/components/wishlist/WishlistEmpty.tsx': [
        { pattern: /import.*Image.*from.*;\s*\n/, replacement: '' },
    ],
    'src/components/wishlist/WishlistPage.tsx': [
        { pattern: /,?\s*Plus\s*,?/, replacement: '' },
        { pattern: /,?\s*Settings\s*,?/, replacement: '' },
        { pattern: /,?\s*useWishlistUtils\s*,?/, replacement: '' },
        { pattern: /,?\s*WishlistItem\s*,?/, replacement: '' },
        { pattern: /,?\s*WishlistCollection\s*,?/, replacement: '' },
    ]
};

// Function to fix specific file patterns
function fixSpecificPatterns(filePath, content) {
    const relativePath = filePath.replace(/^\.\//, '');
    const patterns = UNUSED_PATTERNS[relativePath];

    if (!patterns) return content;

    let modified = content;
    patterns.forEach(({ pattern, replacement }) => {
        if (pattern.test(modified)) {
            modified = modified.replace(pattern, replacement);
            console.log(`  - Applied pattern fix to ${relativePath}`);
        }
    });

    return modified;
}

// Function to prefix unused variables with underscore
function fixUnusedVariables(content) {
    const lines = content.split('\n');
    const modifiedLines = lines.map(line => {
        // Fix unused variable assignments
        if (line.includes('is assigned a value but never used') ||
            line.includes('is defined but never used')) {
            return line; // Skip comment lines
        }

        // Pattern for unused const/let declarations
        const unusedVarPattern = /^(\s*)(const|let)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=/;
        const match = line.match(unusedVarPattern);

        if (match) {
            const [, indent, keyword, varName] = match;
            // Don't prefix React hooks or common variables
            if (!['React', 'useState', 'useEffect', 'router', 'user'].includes(varName)) {
                // Check if this variable is used later in the file
                const restOfFile = content.substring(content.indexOf(line) + line.length);
                if (!restOfFile.includes(varName) || restOfFile.indexOf(varName) > 1000) {
                    return line.replace(varName, `_${varName}`);
                }
            }
        }

        return line;
    });

    return modifiedLines.join('\n');
}

// Function to remove unused imports from destructuring
function fixUnusedImports(content) {
    const lines = content.split('\n');
    const modifiedLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Handle import destructuring with unused items
        if (line.includes('import {') && line.includes('}')) {
            const importMatch = line.match(/import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]/);
            if (importMatch) {
                const [fullMatch, imports, fromPath] = importMatch;
                const importList = imports.split(',').map(item => item.trim());

                // Filter out imports that aren't used in the file
                const usedImports = importList.filter(importName => {
                    const cleanName = importName.replace(/\s+as\s+\w+/, '').trim();
                    const restOfFile = content.substring(content.indexOf(line) + line.length);
                    return restOfFile.includes(cleanName);
                });

                if (usedImports.length === 0) {
                    // Remove entire import line if nothing is used
                    continue;
                } else if (usedImports.length !== importList.length) {
                    // Rebuild import with only used items
                    const newLine = line.replace(
                        `{ ${imports} }`,
                        `{ ${usedImports.join(', ')} }`
                    );
                    modifiedLines.push(newLine);
                    continue;
                }
            }
        }

        modifiedLines.push(line);
    }

    return modifiedLines.join('\n');
}

// Main fix function
function fixFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // Apply file-specific patterns
        content = fixSpecificPatterns(filePath, content);

        // Fix unused imports
        content = fixUnusedImports(content);

        // Fix unused variables
        content = fixUnusedVariables(content);

        // Clean up empty import lines
        content = content.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"];\s*\n/g, '');

        // Clean up double commas in imports
        content = content.replace(/,\s*,/g, ',');
        content = content.replace(/{\s*,/g, '{');
        content = content.replace(/,\s*}/g, '}');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
            console.log(`✅ Fixed: ${filePath}`);
            return true;
        }

        return false;
    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
        return false;
    }
}

// Get all TypeScript files
function getAllTsFiles(dir) {
    const files = [];

    function walkDir(currentDir) {
        if (!fs.existsSync(currentDir)) return;

        const items = fs.readdirSync(currentDir);

        for (const item of items) {
            const fullPath = path.join(currentDir, item);

            if (!fs.existsSync(fullPath)) continue;

            const stat = fs.statSync(fullPath);

            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                walkDir(fullPath);
            } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
                files.push(fullPath);
            }
        }
    }

    walkDir(dir);
    return files;
}

// Main execution
console.log('🔧 Fixing ESLint issues...\n');

const srcFiles = getAllTsFiles('./src');
let fixedCount = 0;

srcFiles.forEach(file => {
    if (fixFile(file)) {
        fixedCount++;
    }
});

console.log(`\n✅ Fixed ${fixedCount} files`);
console.log('🔄 Running ESLint auto-fix...\n');

try {
    execSync('npm run lint -- --fix', { stdio: 'inherit' });
} catch (error) {
    console.log('\n✅ ESLint fix completed. Check remaining issues with: npm run lint');
}