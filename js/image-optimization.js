/**
 * Image Optimization Script
 * Handles:
 * - WebP format detection and usage
 * - Responsive image loading
 * - Image compression
 * - Image loading prioritization
 */

// Check for WebP support
function checkWebpSupport() {
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
        // Check for WebP format support by attempting to encode and decode
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
}

// Check for AVIF support
function checkAvifSupport() {
    const img = new Image();
    img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    return new Promise(resolve => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
    });
}

// Add WebP/AVIF support class to document for CSS targeting
document.addEventListener('DOMContentLoaded', async function() {
    // Check image format support
    if (checkWebpSupport()) {
        document.documentElement.classList.add('webp-support');
    } else {
        document.documentElement.classList.add('no-webp-support');
    }
    
    const avifSupported = await checkAvifSupport();
    if (avifSupported) {
        document.documentElement.classList.add('avif-support');
    }
    
    // Apply responsive image handling
    setupResponsiveImages();
    
    // Prioritize visible images
    prioritizeVisibleImages();
    
    // Set up LQIP for main images
    setupLQIP();
    
    // Optimize background images
    optimizeBackgroundImages();
    
    // Set up lazy loading
    loadLazyImages();
    
    // Set up error handling
    setupImageErrorHandling();
});

// Set up responsive images based on viewport and screen resolution
function setupResponsiveImages() {
    const images = document.querySelectorAll('img[data-srcset]');
    const devicePixelRatio = window.devicePixelRatio || 1;
    const viewportWidth = window.innerWidth;
    
    images.forEach(img => {
        if (!img.dataset.srcset) return;
        
        // Add native lazy loading for images below the fold
        if (!isElementInViewport(img) && 'loading' in HTMLImageElement.prototype) {
            img.loading = 'lazy';
        }
        
        // Add fetchpriority for important images
        if (isElementInViewport(img) || img.classList.contains('critical')) {
            img.fetchPriority = 'high';
        } else {
            img.fetchPriority = 'auto';
        }
        
        // Parse srcset attribute
        const srcsetEntries = img.dataset.srcset.split(',');
        let bestSrc = '';
        let bestWidth = 0;
        
        srcsetEntries.forEach(entry => {
            const [url, width] = entry.trim().split(' ');
            const widthValue = parseInt(width.replace('w', ''));
            
            // Select appropriate image based on viewport and pixel ratio
            if (widthValue >= viewportWidth * devicePixelRatio && 
                (bestWidth === 0 || widthValue < bestWidth)) {
                bestWidth = widthValue;
                bestSrc = url;
            }
        });
        
        // If no matching size found, use the largest available
        if (!bestSrc && srcsetEntries.length > 0) {
            const lastEntry = srcsetEntries[srcsetEntries.length - 1].trim().split(' ');
            bestSrc = lastEntry[0];
        }
        
        // If webp support is available and there's a webp version, use it
        if (checkWebpSupport() && img.dataset.srcsetWebp) {
            const webpSrcsetEntries = img.dataset.srcsetWebp.split(',');
            
            webpSrcsetEntries.forEach(entry => {
                const [url, width] = entry.trim().split(' ');
                const widthValue = parseInt(width.replace('w', ''));
                
                if (widthValue === bestWidth) {
                    bestSrc = url;
                }
            });
        }
        
        // Set the appropriate source when in viewport
        if (bestSrc) {
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.src = bestSrc;
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    rootMargin: '200px 0px' // Increased preload margin
                });
                
                observer.observe(img);
            } else {
                // Fallback for older browsers
                img.src = bestSrc;
            }
        }
    });
}

// Helper function to check if element is in viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Prioritize images that are in the viewport
function prioritizeVisibleImages() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Set high fetchpriority for visible images
                    img.fetchPriority = 'high';
                    
                    // Preconnect to image domain if from external source
                    if (img.src && img.src.startsWith('http') && !img.src.includes(window.location.hostname)) {
                        const link = document.createElement('link');
                        link.rel = 'preconnect';
                        link.href = new URL(img.src).origin;
                        document.head.appendChild(link);
                    }
                    
                    // Remove low quality placeholder if it exists
                    if (img.classList.contains('lazy-placeholder')) {
                        // Get the corresponding high quality image
                        const highQualityImg = img.parentElement.querySelector('.high-quality');
                        if (highQualityImg && highQualityImg.dataset.src) {
                            highQualityImg.src = highQualityImg.dataset.src;
                            highQualityImg.style.opacity = 1;
                            
                            // Fade out placeholder
                            img.style.opacity = 0;
                            setTimeout(() => {
                                img.remove();
                            }, 500);
                        }
                    }
                    
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '200px 0px' // Start loading further before they come into view
        });
        
        // Observe all images
        document.querySelectorAll('img').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Apply LQIP (Low Quality Image Placeholders) pattern for main images
function setupLQIP() {
    const imageContainers = document.querySelectorAll('.lqip-container');
    
    imageContainers.forEach(container => {
        const placeholder = container.querySelector('.lazy-placeholder');
        const highQualityImg = container.querySelector('.high-quality');
        
        if (placeholder && highQualityImg && highQualityImg.dataset.src) {
            // Use native lazy loading when available
            if ('loading' in HTMLImageElement.prototype && !isElementInViewport(container)) {
                highQualityImg.loading = 'lazy';
            }
            
            // Preload high quality image
            const img = new Image();
            img.onload = function() {
                // When high quality image is loaded, swap them
                highQualityImg.src = highQualityImg.dataset.src;
                highQualityImg.style.opacity = 1;
                
                // Fade out placeholder
                placeholder.style.opacity = 0;
                setTimeout(() => {
                    placeholder.remove();
                }, 500);
            };
            
            // Start loading the image when in viewport
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            img.src = highQualityImg.dataset.src;
                            observer.unobserve(container);
                        }
                    });
                }, {
                    rootMargin: '200px 0px' // Increased preload margin
                });
                
                observer.observe(container);
            } else {
                // Fallback for older browsers
                img.src = highQualityImg.dataset.src;
            }
        }
    });
}

// Function to convert background images for better performance
function optimizeBackgroundImages() {
    const elements = document.querySelectorAll('[data-background]');
    
    elements.forEach(el => {
        if (el.dataset.background) {
            // Choose format based on support
            let bgUrl = el.dataset.background;
            
            if (checkWebpSupport() && el.dataset.backgroundWebp) {
                bgUrl = el.dataset.backgroundWebp;
            }
            
            // Only load when in viewport
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // Set the background image
                            el.style.backgroundImage = `url(${bgUrl})`;
                            observer.unobserve(el);
                        }
                    });
                }, {
                    rootMargin: '200px 0px' // Increased preload margin
                });
                
                observer.observe(el);
            } else {
                // Fallback for older browsers
                el.style.backgroundImage = `url(${bgUrl})`;
            }
        }
    });
}

// Function to handle data-src lazy loading with native lazy loading support
function loadLazyImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    // Use native lazy loading when available
    if ('loading' in HTMLImageElement.prototype) {
        lazyImages.forEach(img => {
            // Don't apply to images in viewport or marked as critical
            if (!isElementInViewport(img) && !img.classList.contains('critical')) {
                img.loading = 'lazy';
            }
            
            // Set proper priority hints
            if (isElementInViewport(img) || img.classList.contains('critical')) {
                img.fetchPriority = 'high';
            } else {
                img.fetchPriority = 'low';
            }
            
            if (img.dataset.src && img.dataset.src !== 'undefined' && !img.dataset.src.includes('undefined')) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    } else if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src && img.dataset.src !== 'undefined' && !img.dataset.src.includes('undefined')) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    } else if (img.dataset.src) {
                        // If data-src is undefined or contains undefined, hide the image
                        console.warn('Image has invalid data-src attribute:', img.dataset.src);
                        img.style.display = 'none';
                    }
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '200px 0px' // Increased preload margin
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        lazyImages.forEach(img => {
            if (img.dataset.src && img.dataset.src !== 'undefined' && !img.dataset.src.includes('undefined')) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    }
}

// Function to handle error cases for images
function setupImageErrorHandling() {
    document.addEventListener('error', function(e) {
        if (e.target.tagName.toLowerCase() === 'img') {
            const img = e.target;
            
            // Try to use a fallback image if available
            if (img.dataset.fallback) {
                img.src = img.dataset.fallback;
            } else if (img.src.includes('/assets/images/')) {
                // Use a placeholder with matching dimensions
                img.src = `https://via.placeholder.com/${img.width || '300'}x${img.height || '200'}?text=Image+Not+Found`;
            }
            
            // Add error class for styling
            img.classList.add('image-error');
        }
    }, true);
}

// Prefetch critical images on page load completion
window.addEventListener('load', function() {
    // Get next page links and prefetch their critical images
    const nextPageLinks = document.querySelectorAll('a[data-prefetch="true"]');
    
    if ('IntersectionObserver' in window) {
        const linkObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const link = entry.target;
                    const href = link.getAttribute('href');
                    
                    if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                        // Create a preconnect link
                        const preconnect = document.createElement('link');
                        preconnect.rel = 'preconnect';
                        preconnect.href = new URL(href, window.location.href).origin;
                        document.head.appendChild(preconnect);
                        
                        // Create a prefetch link
                        const prefetch = document.createElement('link');
                        prefetch.rel = 'prefetch';
                        prefetch.href = href;
                        document.head.appendChild(prefetch);
                    }
                    
                    linkObserver.unobserve(link);
                }
            });
        }, {
            rootMargin: '200px 0px'
        });
        
        nextPageLinks.forEach(link => {
            linkObserver.observe(link);
        });
    }
}); 