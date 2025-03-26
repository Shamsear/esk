const fs = require('fs');
const path = require('path');

// Get all HTML files
function getAllHtmlFiles(dir) {
    let htmlFiles = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Skip node_modules directory to avoid unnecessary processing
            if (file !== 'node_modules') {
                htmlFiles = htmlFiles.concat(getAllHtmlFiles(fullPath));
            }
        } else if (file.endsWith('.html')) {
            htmlFiles.push(fullPath);
        }
    }
    
    return htmlFiles;
}

// Remove image-optimization.js script from file content
function removeImageOptimizationScript(content) {
    return content.replace(/<script[^>]*src=['"]js\/image-optimization\.js['"][^>]*><\/script>\s*/g, '');
}

// Process all HTML files
const htmlFiles = getAllHtmlFiles('.');
let modifiedCount = 0;

console.log(`Found ${htmlFiles.length} HTML files`);

for (const file of htmlFiles) {
    try {
        let content = fs.readFileSync(file, 'utf8');
        const originalContent = content;
        
        content = removeImageOptimizationScript(content);
        
        // Only write to file if changes were made
        if (content !== originalContent) {
            fs.writeFileSync(file, content, 'utf8');
            modifiedCount++;
            console.log(`Removed image-optimization.js from: ${file}`);
        }
    } catch (error) {
        console.error(`Error processing ${file}:`, error.message);
    }
}

console.log(`Modified ${modifiedCount} files.`);

// Update service-worker.js to remove the image-optimization.js cache entry
try {
    if (fs.existsSync('./service-worker.js')) {
        let swContent = fs.readFileSync('./service-worker.js', 'utf8');
        
        // Remove image-optimization.js from cache list
        swContent = swContent.replace(/'js\/image-optimization\.js',?\s*/g, '');
        
        fs.writeFileSync('./service-worker.js', swContent, 'utf8');
        console.log('Updated service-worker.js');
    }
} catch (error) {
    console.error('Error updating service-worker.js:', error.message);
}

console.log('Image optimization removal completed!'); 