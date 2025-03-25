/**
 * Club Logos Verification Script
 * 
 * This script helps verify that all club logos are properly optimized
 * and available in the correct format.
 */

const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');

// Configuration
const CLUB_LOGOS_DIR = path.resolve(__dirname, '../assets/images/players/club');
const REQUIRED_FORMATS = ['webp'];
const MAX_SIZE_KB = 40;
const TARGET_DIMENSIONS = { width: 100, height: 100 };

// Check if directory exists
if (!fs.existsSync(CLUB_LOGOS_DIR)) {
    console.error(`Club logos directory not found: ${CLUB_LOGOS_DIR}`);
    process.exit(1);
}

// Get all image files
const imageFiles = fs.readdirSync(CLUB_LOGOS_DIR).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
});

console.log(`Found ${imageFiles.length} image files in ${CLUB_LOGOS_DIR}`);

// Statistics
const stats = {
    total: imageFiles.length,
    webpCount: 0,
    lowQualityCount: 0,
    oversized: [],
    wrongDimensions: [],
    missingLowQuality: []
};

// Check each image
imageFiles.forEach(file => {
    const filePath = path.join(CLUB_LOGOS_DIR, file);
    const fileExt = path.extname(file).toLowerCase().replace('.', '');
    const fileStats = fs.statSync(filePath);
    const sizeKB = fileStats.size / 1024;
    
    // Check file format
    if (fileExt === 'webp') {
        stats.webpCount++;
    }
    
    // Check if file is low quality version
    if (file.includes('-low')) {
        stats.lowQualityCount++;
    } else {
        // Check if this file has a corresponding low quality version
        const lowQualityFile = file.replace(`.${fileExt}`, `-low.${fileExt}`);
        const lowQualityPath = path.join(CLUB_LOGOS_DIR, lowQualityFile);
        
        if (!fs.existsSync(lowQualityPath)) {
            stats.missingLowQuality.push(file);
        }
    }
    
    // Check file size
    if (sizeKB > MAX_SIZE_KB) {
        stats.oversized.push({
            file,
            size: `${sizeKB.toFixed(2)} KB`,
            maxSize: `${MAX_SIZE_KB} KB`
        });
    }
    
    // Check dimensions
    try {
        const dimensions = sizeOf(filePath);
        if (dimensions.width > TARGET_DIMENSIONS.width || dimensions.height > TARGET_DIMENSIONS.height) {
            stats.wrongDimensions.push({
                file,
                dimensions: `${dimensions.width}x${dimensions.height}`,
                target: `${TARGET_DIMENSIONS.width}x${TARGET_DIMENSIONS.height}`
            });
        }
    } catch (error) {
        console.error(`Error getting dimensions for ${file}: ${error.message}`);
    }
});

// Display results
console.log('\n===== CLUB LOGOS VERIFICATION RESULTS =====');
console.log(`Total Images: ${stats.total}`);
console.log(`WebP Format: ${stats.webpCount} (${((stats.webpCount / stats.total) * 100).toFixed(2)}%)`);
console.log(`Low Quality Versions: ${stats.lowQualityCount}\n`);

console.log('---- ISSUES ----');

if (stats.oversized.length > 0) {
    console.log(`\nOversized Images (>${MAX_SIZE_KB} KB): ${stats.oversized.length}`);
    stats.oversized.forEach(item => {
        console.log(`- ${item.file}: ${item.size} (should be < ${item.maxSize})`);
    });
}

if (stats.wrongDimensions.length > 0) {
    console.log(`\nWrong Dimensions: ${stats.wrongDimensions.length}`);
    stats.wrongDimensions.forEach(item => {
        console.log(`- ${item.file}: ${item.dimensions} (should be <= ${item.target})`);
    });
}

if (stats.missingLowQuality.length > 0) {
    console.log(`\nMissing Low Quality Versions: ${stats.missingLowQuality.length}`);
    stats.missingLowQuality.forEach(file => {
        console.log(`- ${file}`);
    });
}

// Overall status
if (stats.oversized.length === 0 && stats.wrongDimensions.length === 0 && stats.missingLowQuality.length === 0) {
    console.log('\n✅ SUCCESS: All club logos are properly optimized!');
} else {
    console.log('\n⚠️ ISSUES FOUND: Some club logos need optimization.');
    console.log(`Run the optimize-club-logos.js script to fix these issues.`);
} 