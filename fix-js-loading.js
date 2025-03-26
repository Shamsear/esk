const fs = require('fs');
const path = require('path');

// Get all HTML files
function getAllHtmlFiles(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && file !== 'node_modules') {
            results = results.concat(getAllHtmlFiles(fullPath));
        } else if (file.endsWith('.html')) {
            results.push(fullPath);
        }
    }
    
    return results;
}

// Fix HTML files
const htmlFiles = getAllHtmlFiles('.');
console.log(`Found ${htmlFiles.length} HTML files to process`);

let totalFixed = 0;

htmlFiles.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Replace class="js-loading" with empty class attribute or no class
        const newContent = content.replace(/<html lang="en" class="js-loading">/, '<html lang="en">');
        
        if (content !== newContent) {
            fs.writeFileSync(file, newContent);
            console.log(`Fixed js-loading class in ${file}`);
            totalFixed++;
        }
    } catch (error) {
        console.error(`Error processing ${file}:`, error.message);
    }
});

console.log(`\nTotal fixes: ${totalFixed} HTML files updated`);
console.log('All fixes completed!'); 