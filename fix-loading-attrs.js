const fs = require('fs');

// Read the manager-ranking.html file
let content = fs.readFileSync('manager-ranking.html', 'utf8');

// Remove loading="lazy" attributes
content = content.replace(/loading="lazy"/g, '');

// Write the updated content back to the file
fs.writeFileSync('manager-ranking.html', content);

console.log('Fixed loading attributes in manager-ranking.html');

// Now let's add Vercel Analytics script if it's missing
if (!content.includes('vercel-analytics.js')) {
    content = content.replace(
        /<script defer src="js\/performance.js"><\/script>\s*<\/body>/g, 
        '<script defer src="js/performance.js"></script>\n    <script defer src="js/vercel-analytics.js"></script>\n    </body>'
    );
    
    // Write the updated content back to the file
    fs.writeFileSync('manager-ranking.html', content);
    console.log('Added Vercel Analytics script to manager-ranking.html');
}

// Now process the remaining files
const filesToFix = [
    'trophy-cabinet.html',
    'registered-clubs.html'
];

filesToFix.forEach(file => {
    if (fs.existsSync(file)) {
        let fileContent = fs.readFileSync(file, 'utf8');
        
        // Remove loading="lazy" attributes
        fileContent = fileContent.replace(/loading="lazy"/g, '');
        
        // Add Vercel Analytics script if it's missing
        if (!fileContent.includes('vercel-analytics.js')) {
            fileContent = fileContent.replace(
                /<script defer src="js\/performance.js"><\/script>\s*<\/body>/g, 
                '<script defer src="js/performance.js"></script>\n    <script defer src="js/vercel-analytics.js"></script>\n    </body>'
            );
        }
        
        // Write the updated content back to the file
        fs.writeFileSync(file, fileContent);
        console.log(`Fixed loading attributes and added Vercel Analytics to ${file}`);
    } else {
        console.log(`File ${file} does not exist.`);
    }
}); 