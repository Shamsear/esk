// Simple script to convert all images to WebP format in HTML files
const fs = require('fs');

// Force console output at the start
console.log("=== WebP Conversion Script Started ===");

// List of HTML files to process
const htmlFiles = [
  'index.html',
  'player-status.html',
  'admin-login.html',
  'career-mode.html',
  'career-tournament.html',
  'manager-ranking.html',
  'offline.html',
  'player-signing.html',
  'player-admin.html',
  'registered-clubs.html',
  'tournament-guide.html',
  'trophy-cabinet.html',
  'carhome.html'
];

console.log(`Found ${htmlFiles.length} HTML files to process`);

// Create a function to handle each file
function processFile(file) {
  console.log(`\nChecking ${file}...`);
  
  // Skip if file doesn't exist
  if (!fs.existsSync(file)) {
    console.log(`  - Skipping ${file} (not found)`);
    return false;
  }

  try {
    let content = fs.readFileSync(file, 'utf8');
    console.log(`  - File size: ${content.length} bytes`);
    let modified = false;

    // Add js-loading class to html tag
    const htmlPattern = /<html([^>]*)>/i;
    if (htmlPattern.test(content)) {
      content = content.replace(htmlPattern, (match, attrs) => {
        if (!/class=/.test(attrs)) {
          modified = true;
          console.log(`  - Adding js-loading class to <html> tag`);
          return `<html${attrs} class="js-loading">`;
        } else if (!/js-loading/.test(attrs)) {
          modified = true;
          console.log(`  - Adding js-loading to existing HTML classes`);
          return match.replace(/class="([^"]*)"/, 'class="$1 js-loading"');
        }
        return match;
      });
    }

    // Update non-WebP image sources to WebP
    let imgCount = 0;
    const imgPattern = /src="([^"]*\.(jpe?g|png|gif))"/gi;
    if (content.match(imgPattern)) {
      content = content.replace(imgPattern, (match, src, ext) => {
        imgCount++;
        const webpSrc = src.replace(/\.(jpe?g|png|gif)$/i, '.webp');
        modified = true;
        return `src="${webpSrc}"`;
      });
      console.log(`  - Converted ${imgCount} images to WebP format`);
    }

    // Convert data-src to src for WebP images
    let dataSrcCount = 0;
    const dataSrcPattern = /data-src="([^"]*)"/gi;
    if (content.match(dataSrcPattern)) {
      content = content.replace(dataSrcPattern, (match, src) => {
        dataSrcCount++;
        modified = true;
        return `src="${src}"`;
      });
      console.log(`  - Converted ${dataSrcCount} data-src attributes to src`);
    }

    // Add missing scripts before body end
    const scriptTags = [];
    if (!content.includes('js/image-optimization.js')) {
      scriptTags.push('    <!-- Image optimization -->\n    <script defer src="js/image-optimization.js"></script>');
      console.log(`  - Adding missing image-optimization.js script`);
      modified = true;
    }
    if (!content.includes('js/performance.js')) {
      scriptTags.push('    <!-- Performance optimization -->\n    <script defer src="js/performance.js"></script>');
      console.log(`  - Adding missing performance.js script`);
      modified = true;
    }

    if (scriptTags.length > 0) {
      const bodyEndPos = content.lastIndexOf('</body>');
      if (bodyEndPos !== -1) {
        content = content.slice(0, bodyEndPos) + '\n' + scriptTags.join('\n') + '\n' + content.slice(bodyEndPos);
      }
    }

    // Only save if changes were made
    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`  ✓ Updated ${file}`);
      return true;
    } else {
      console.log(`  - No changes needed for ${file}`);
      return false;
    }
  } catch (err) {
    console.error(`  ✗ Error processing ${file}:`, err.message);
    return false;
  }
}

// Process all files
let updatedCount = 0;
for (const file of htmlFiles) {
  if (processFile(file)) {
    updatedCount++;
  }
}

// Final report
console.log("\n=== WebP Conversion Results ===");
console.log(`Files processed: ${htmlFiles.length}`);
console.log(`Files updated: ${updatedCount}`);
console.log("WebP conversion and optimization completed.");
