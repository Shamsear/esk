// Image compression script for better performance
// Note: This script requires the 'sharp' package to be installed
// Install with: npm install sharp

console.log('This script will compress image assets when run with the required dependencies');
console.log('To use this script:');
console.log('1. Install Node.js dependencies: npm install sharp');
console.log('2. Run this script: node compress-assets.js');
console.log('');
console.log('Example implementation:');

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const config = {
    imagesDir: './assets/images',
    outputDir: './assets/images',
    quality: 80,
    maxWidth: 1920,
    createWebp: true,
    createLowQuality: true
};

console.log('Starting image optimization...');

// Create output directory if it doesn't exist
if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
}

// Process image files recursively
async function processDirectory(directory) {
    try {
        const entries = fs.readdirSync(directory, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);
            
            if (entry.isDirectory()) {
                // Skip optimized directory to avoid reprocessing
                if (entry.name === 'optimized') continue;
                
                // Create corresponding directory in output
                const relativePath = path.relative(config.imagesDir, fullPath);
                const outputSubDir = path.join(config.outputDir, relativePath);
                
                if (!fs.existsSync(outputSubDir)) {
                    fs.mkdirSync(outputSubDir, { recursive: true });
                }
                
                await processDirectory(fullPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                
                // Process only image files
                if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                    const relativePath = path.relative(config.imagesDir, directory);
                    const dirPath = path.join(config.outputDir, relativePath);
                    
                    // Create WebP filename
                    const baseName = path.basename(entry.name, ext);
                    const webpName = path.join(dirPath, baseName + '.webp');
                    const lowQualityName = path.join(dirPath, baseName + '-low' + ext);
                    
                    console.log(`Processing: ${fullPath}`);
                    
                    try {
                        // Get image metadata
                        const metadata = await sharp(fullPath).metadata();
                        
                        // Create WebP version (better compression, modern browsers)
                        if (config.createWebp) {
                            const webpOptions = {
                                quality: config.quality,
                                effort: 6 // Higher effort = better compression
                            };
                            
                            // If larger than maxWidth, resize for WebP
                            if (metadata.width > config.maxWidth) {
                                await sharp(fullPath)
                                    .resize(config.maxWidth)
                                    .webp(webpOptions)
                                    .toFile(webpName);
                            } else {
                                await sharp(fullPath)
                                    .webp(webpOptions)
                                    .toFile(webpName);
                            }
                            
                            console.log(`  ✓ Saved WebP: ${webpName}`);
                        }
                        
                        // Create low quality version for low-end devices
                        if (config.createLowQuality) {
                            // Calculate dimensions - 50% of original but max 400px wide
                            const lowWidth = Math.min(Math.round(metadata.width * 0.5), 400);
                            
                            // Save low quality version
                            await sharp(fullPath)
                                .resize(lowWidth)
                                .jpeg({ quality: 60 })
                                .toFile(lowQualityName);
                            
                            console.log(`  ✓ Saved low quality: ${lowQualityName}`);
                        }
                    } catch (err) {
                        console.error(`  ✗ Error processing ${fullPath}:`, err.message);
                    }
                }
            }
        }
    } catch (err) {
        console.error(`Error reading directory ${directory}:`, err.message);
    }
}

// Create responsive image set for key images
async function createResponsiveSet(imagePath) {
    if (!fs.existsSync(imagePath)) {
        console.error(`Image ${imagePath} does not exist.`);
        return;
    }
    
    const directory = path.dirname(imagePath);
    const filename = path.basename(imagePath);
    const ext = path.extname(filename);
    const baseName = path.basename(filename, ext);
    
    // Define responsive image sizes
    const sizes = [320, 640, 768, 1024, 1366, 1920];
    
    console.log(`Creating responsive set for: ${imagePath}`);
    
    try {
        // Get image metadata
        const metadata = await sharp(imagePath).metadata();
        
        // Create each size
        for (const width of sizes) {
            // Skip sizes larger than original
            if (width >= metadata.width) continue;
            
            const responsiveFilename = path.join(directory, `${baseName}-${width}${ext}`);
            const responsiveWebP = path.join(directory, `${baseName}-${width}.webp`);
            
            // Create resized JPG/PNG
            await sharp(imagePath)
                .resize(width)
                .toFile(responsiveFilename);
                
            // Create WebP version
            await sharp(imagePath)
                .resize(width)
                .webp({ quality: config.quality })
                .toFile(responsiveWebP);
                
            console.log(`  ✓ Created ${width}px: ${responsiveFilename}`);
            console.log(`  ✓ Created ${width}px WebP: ${responsiveWebP}`);
        }
    } catch (err) {
        console.error(`  ✗ Error creating responsive set for ${imagePath}:`, err.message);
    }
}

// Function to find and optimize the most important images
async function optimizeKeyImages() {
    const keyImages = [
        // Logo and common UI elements
        './assets/images/logo11.png',
        // Add other key images here
    ];
    
    console.log('Optimizing key images...');
    
    for (const imagePath of keyImages) {
        if (fs.existsSync(imagePath)) {
            await createResponsiveSet(imagePath);
        }
    }
}

// Start processing
(async () => {
    // First optimize key images
    await optimizeKeyImages();
    
    // Then process all images
    await processDirectory(config.imagesDir);
    
    console.log('Finished image optimization!');
    console.log('');
    console.log('Performance tips:');
    console.log('1. Add WebP images to your HTML using the picture element:');
    console.log(`
    <picture>
      <source srcset="image.webp" type="image/webp">
      <img src="image.jpg" alt="Description" width="800" height="600">
    </picture>`);
    console.log('');
    console.log('2. Use responsive images with srcset for different screen sizes:');
    console.log(`
    <img srcset="image-320.jpg 320w,
                 image-640.jpg 640w,
                 image-1024.jpg 1024w"
         sizes="(max-width: 320px) 280px,
                (max-width: 640px) 600px,
                1024px"
         src="image.jpg" alt="Description">
    `);
})();

console.log('');
console.log('Other performance tips:');
console.log('1. Use modern image formats like WebP');
console.log('2. Enable GZIP compression on your server');
console.log('3. Implement proper browser caching with cache-control headers');
console.log('4. Consider using a CDN for static assets');
console.log('5. Minify CSS and JavaScript files'); 