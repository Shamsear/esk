const fs = require('fs');

// List of all HTML files to update
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

// Process each file
htmlFiles.forEach(file => {
  try {
    // Check if file exists
    if (!fs.existsSync(file)) {
      console.log(`File not found: ${file}`);
      return;
    }

    console.log(`Processing ${file}...`);
    let content = fs.readFileSync(file, 'utf8');
    
    // Add js-loading class to html tag
    content = content.replace(/<html([^>]*)>/i, (match, attrs) => {
      if (!/class=/.test(attrs)) {
        return `<html${attrs} class="js-loading">`;
      } else if (!/js-loading/.test(attrs)) {
        return match.replace(/class="([^"]*)"/i, 'class="$1 js-loading"');
      }
      return match;
    });
    
    // Update image sources to use WebP
    content = content.replace(/src="([^"]*\.(jpe?g|png|gif))"/gi, (match, src) => {
      const webpSrc = src.replace(/\.(jpe?g|png|gif)$/i, '.webp');
      return `src="${webpSrc}"`;
    });
    
    // Ensure performance scripts are loaded
    if (!content.includes('js/image-optimization.js')) {
      const bodyEndPos = content.lastIndexOf('</body>');
      if (bodyEndPos !== -1) {
        let scriptTags = '\n    <!-- Image optimization -->\n    <script defer src="js/image-optimization.js"></script>\n';
        if (!content.includes('js/performance.js')) {
          scriptTags += '    <!-- Performance optimization -->\n    <script defer src="js/performance.js"></script>\n';
        }
        content = content.slice(0, bodyEndPos) + scriptTags + content.slice(bodyEndPos);
      }
    }
    
    // Save the updated file
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
});

console.log('All HTML files have been updated to use WebP format.');
