// HTML Optimizer Script
const fs = require('fs');
const path = require('path');

// Get all HTML files in the current directory
function getHtmlFiles(directory) {
    const files = fs.readdirSync(directory);
    return files.filter(file => file.endsWith('.html'));
}

// Main script
console.log('Starting HTML optimization...');
const htmlFiles = getHtmlFiles('.');

htmlFiles.forEach(file => {
    console.log(`Optimizing ${file}...`);
    try {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;
        
        // Add performance.js script if not present
        if (!content.includes('performance.js') && content.includes('</body>')) {
            content = content.replace('</body>', '    <!-- Load performance optimizations -->\n    ' + 
                '<script defer src="js/performance.js"></script>\n</body>');
            modified = true;
        }
        
        // Add background-scroll.js script if not present
        if (!content.includes('background-scroll.js') && content.includes('</body>')) {
            content = content.replace('</body>', '    <!-- Load background scroll handling -->\n    ' + 
                '<script defer src="js/background-scroll.js"></script>\n</body>');
            modified = true;
        }
        
        // Add fix-overflow.js script if not present
        if (!content.includes('fix-overflow.js') && content.includes('</body>')) {
            content = content.replace('</body>', '    <!-- Fix infinite scrolling -->\n    ' + 
                '<script defer src="js/fix-overflow.js"></script>\n</body>');
            modified = true;
        }
        
        // Save the file if it was modified
        if (modified) {
            fs.writeFileSync(file, content);
            console.log(`✓ Optimized ${file}`);
        } else {
            console.log(`○ No changes needed for ${file}`);
        }
    } catch (error) {
        console.error(`✗ Error processing ${file}:`, error);
    }
}); 