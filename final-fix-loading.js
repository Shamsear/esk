const fs = require('fs');
const path = require('path');

// Get all HTML files recursively
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
function fixHtmlFiles() {
    const htmlFiles = getAllHtmlFiles('.');
    console.log(`Found ${htmlFiles.length} HTML files to process`);
    
    let totalFixed = 0;
    
    htmlFiles.forEach(file => {
        try {
            const content = fs.readFileSync(file, 'utf8');
            
            // Count how many instances of loading="lazy" are in the file
            const lazyCount = (content.match(/loading=["']lazy["']/g) || []).length;
            
            if (lazyCount > 0) {
                // Replace all occurrences of loading="lazy" with empty string
                const newContent = content.replace(/loading=["']lazy["']/g, '');
                
                fs.writeFileSync(file, newContent);
                console.log(`Fixed ${lazyCount} lazy loading attributes in ${file}`);
                totalFixed += lazyCount;
            }
        } catch (error) {
            console.error(`Error processing ${file}:`, error.message);
        }
    });
    
    console.log(`\nTotal fixes: ${totalFixed} lazy loading attributes removed`);
}

// Also check for CSS that might affect image loading
function checkCssStyles() {
    try {
        const cssFiles = fs.readdirSync('css').filter(file => file.endsWith('.css'));
        
        cssFiles.forEach(file => {
            const fullPath = path.join('css', file);
            const content = fs.readFileSync(fullPath, 'utf8');
            
            if (content.includes('.js-loading')) {
                console.log(`Found .js-loading style in ${fullPath}`);
            }
            
            if (content.includes('opacity: 0')) {
                console.log(`Found opacity: 0 style in ${fullPath} which might affect image visibility`);
            }
        });
    } catch (error) {
        console.error('Error checking CSS files:', error.message);
    }
}

// Fix JS files that might be applying lazy loading
function checkJsFiles() {
    try {
        const jsFiles = fs.readdirSync('js').filter(file => file.endsWith('.js'));
        
        jsFiles.forEach(file => {
            const fullPath = path.join('js', file);
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Look for any loading="lazy" strings in JavaScript files
            if (content.includes('loading="lazy"')) {
                console.log(`Found loading="lazy" in ${fullPath}`);
            }
            
            // Look for any code that might be adding the loading="lazy" attribute
            if (content.includes('setAttribute') && content.includes('loading')) {
                console.log(`Found code that might be setting loading attribute in ${fullPath}`);
            }
        });
    } catch (error) {
        console.error('Error checking JS files:', error.message);
    }
}

// Run all checks and fixes
fixHtmlFiles();
checkCssStyles();
checkJsFiles();

console.log('All fixes completed!'); 