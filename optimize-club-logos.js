const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const config = {
    clubImagesDir: './assets/images/players/club',
    quality: 80,
    createLowQuality: true,
    maxSize: 40, // Max size in KB for any club logo
    targetSize: {
        width: 100,
        height: 100
    }
};

console.log('Starting club logo optimization...');

// Process all club logos
async function optimizeClubLogos() {
    try {
        const files = fs.readdirSync(config.clubImagesDir);
        
        console.log(`Found ${files.length} club logos to optimize`);
        
        for (const file of files) {
            const filePath = path.join(config.clubImagesDir, file);
            const stats = fs.statSync(filePath);
            const fileSizeInKB = stats.size / 1024;
            
            // Skip if not an image
            if (!file.endsWith('.webp') && !file.endsWith('.png') && !file.endsWith('.jpg') && !file.endsWith('.jpeg')) {
                continue;
            }
            
            console.log(`Processing: ${file} (${fileSizeInKB.toFixed(2)} KB)`);
            
            // If file is already small enough, we might just convert it to webp
            const needsResize = fileSizeInKB > config.maxSize;
            
            try {
                // Get image metadata
                const metadata = await sharp(filePath).metadata();
                const ext = path.extname(file);
                const baseName = path.basename(file, ext);
                
                // Target filenames - add suffix to avoid name conflicts
                const optimizedName = path.join(config.clubImagesDir, baseName + '-opt.webp');
                const lowQualityName = path.join(config.clubImagesDir, baseName + '-low.webp');
                
                // Create optimized version
                let pipeline = sharp(filePath);
                
                // Resize if needed
                if (needsResize || metadata.width > config.targetSize.width || metadata.height > config.targetSize.height) {
                    pipeline = pipeline.resize({
                        width: config.targetSize.width,
                        height: config.targetSize.height,
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
                    });
                }
                
                // Convert to WebP with good compression
                await pipeline
                    .webp({ quality: config.quality, effort: 6 })
                    .toFile(optimizedName);
                
                // Check the new file size
                const optimizedStats = fs.statSync(optimizedName);
                const optimizedSizeInKB = optimizedStats.size / 1024;
                console.log(`  ✓ Optimized: ${optimizedName} (${optimizedSizeInKB.toFixed(2)} KB)`);
                
                // Create low quality version for low-end devices
                if (config.createLowQuality) {
                    await sharp(filePath)
                        .resize({
                            width: Math.floor(config.targetSize.width / 2),
                            height: Math.floor(config.targetSize.height / 2),
                            fit: 'contain',
                            background: { r: 0, g: 0, b: 0, alpha: 0 }
                        })
                        .webp({ quality: 60, effort: 6 })
                        .toFile(lowQualityName);
                    
                    const lowQualityStats = fs.statSync(lowQualityName);
                    const lowQualitySizeInKB = lowQualityStats.size / 1024;
                    console.log(`  ✓ Low quality: ${lowQualityName} (${lowQualitySizeInKB.toFixed(2)} KB)`);
                }
                
                // If optimization was successful and reduced size significantly, replace the original
                if (optimizedSizeInKB < fileSizeInKB * 0.9) { // 10% smaller at least
                    // Backup original
                    const backupName = path.join(config.clubImagesDir, baseName + '.bak');
                    fs.renameSync(filePath, backupName);
                    fs.renameSync(optimizedName, filePath);
                    console.log(`  ✓ Replaced original with optimized version (saved ${(fileSizeInKB - optimizedSizeInKB).toFixed(2)} KB)`);
                } else {
                    // Remove optimized if it's not better
                    fs.unlinkSync(optimizedName);
                    console.log(`  ✓ Kept original (optimized version not significantly smaller)`);
                }
            } catch (err) {
                console.error(`  ✗ Error processing ${file}:`, err.message);
            }
        }
        
        console.log('Done optimizing club logos!');
    } catch (err) {
        console.error(`Error reading directory ${config.clubImagesDir}:`, err.message);
    }
}

// Run the optimization
optimizeClubLogos(); 