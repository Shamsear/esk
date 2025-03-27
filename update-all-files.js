/**
 * Script to update all HTML files to include background-fix.js script
 * Run with Node.js: node update-all-files.js
 */

const fs = require('fs');
const path = require('path');

// Get all HTML files
function getFiles(directory, extension, files = []) {
    const filesList = fs.readdirSync(directory);
    
    for (const file of filesList) {
        const fullPath = path.join(directory, file);
        
        if (fs.statSync(fullPath).isDirectory()) {
            getFiles(fullPath, extension, files);
        } else if (path.extname(file) === extension) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// Update each HTML file to include the background-fix.js script
function updateHtmlFiles() {
    const htmlFiles = getFiles('.', '.html');
    let updatedCount = 0;
    
    for (const file of htmlFiles) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Check if the file already has the script
        if (!content.includes('background-fix.js')) {
            // Find the position to insert the script (before the closing body tag)
            const scriptPosition = content.lastIndexOf('</body>');
            
            if (scriptPosition !== -1) {
                // If there's an existing script.js reference, add our script after it
                const scriptJsPos = content.lastIndexOf('script.js');
                if (scriptJsPos !== -1 && scriptJsPos < scriptPosition) {
                    const closingScriptTagPos = content.indexOf('</script>', scriptJsPos);
                    if (closingScriptTagPos !== -1 && closingScriptTagPos < scriptPosition) {
                        const insertPosition = closingScriptTagPos + '</script>'.length;
                        content = 
                            content.substring(0, insertPosition) + 
                            '\n    <script src="js/background-fix.js"></script>' +
                            content.substring(insertPosition);
                        updatedCount++;
                    }
                } else {
                    // If no script.js, add before closing body tag
                    content = 
                        content.substring(0, scriptPosition) + 
                        '    <script src="js/background-fix.js"></script>\n' +
                        content.substring(scriptPosition);
                    updatedCount++;
                }
                
                fs.writeFileSync(file, content, 'utf8');
                console.log(`Updated ${file}`);
            }
        } else {
            console.log(`${file} already has background-fix.js reference`);
        }
    }
    
    console.log(`\nUpdated ${updatedCount} HTML files with background-fix.js reference`);
}

console.log('Updating HTML files to include background-fix.js...');
updateHtmlFiles(); 