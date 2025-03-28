// Script.js - Handles animations and interactivity for Eskimos Road to Glory

// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const closeMenu = document.getElementById('closeMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    
    // Mobile menu toggle
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.add('active');
        });
    }
    
    if (closeMenu && mobileMenu) {
        closeMenu.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
        });
    }

    // Get current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isManagerOrClubs = currentPage === 'manager-ranking.html' || currentPage === 'registered-clubs.html';
    
    // Enhanced Intersection Observer options for smoother animations
    const observerOptions = {
        root: null,
        rootMargin: '30px',  // Start animation slightly before element comes into view
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]  // Multiple thresholds for smoother animation
    };
    
    // Create Intersection Observer for scroll animations
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.target.classList.contains('animate-in')) {
                // Calculate animation progress based on intersection ratio
                const progress = Math.min(entry.intersectionRatio * 1.5, 1);
                
                if (progress > 0) {
                    // Apply smooth transition based on scroll position
                    entry.target.style.opacity = progress;
                    entry.target.style.transform = `translateY(${30 * (1 - progress)}px) scale(${0.95 + (0.05 * progress)})`;
                    
                    // Add animate-in class when fully visible
                    if (progress >= 1) {
                        entry.target.classList.add('animate-in');
                        entry.target.style.transform = 'none';
                        observer.unobserve(entry.target);
                    }
                }
            }
        });
    }, observerOptions);

    // Function to set up scroll animations for gallery items
    function setupGalleryAnimations() {
        const galleryItems = document.querySelectorAll('.moze-gallery li');
        
        galleryItems.forEach((item, index) => {
            // Add initial hidden state
            item.classList.add('hidden');
            
            // Calculate staggered delay based on position in viewport
            const rect = item.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const delayMultiplier = rect.top < viewportHeight ? 0.1 : 0.05;
            
            // Add staggered delay based on index and position
            item.style.transitionDelay = `${index * delayMultiplier}s`;
            
            // Start observing
            scrollObserver.observe(item);
            
            // Reset transition delay after animation
            item.addEventListener('transitionend', () => {
                if (item.classList.contains('animate-in')) {
                    item.style.transitionDelay = '0s';
                }
            });
        });
    }

    // Initialize animations based on page
    if (isManagerOrClubs) {
        setupGalleryAnimations();
        
        // Re-run animation setup on scroll to handle dynamic content
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                window.cancelAnimationFrame(scrollTimeout);
            }
            scrollTimeout = window.requestAnimationFrame(() => {
                const hiddenItems = document.querySelectorAll('.moze-gallery li:not(.animate-in)');
                if (hiddenItems.length > 0) {
                    setupGalleryAnimations();
                }
            });
        });
    } else {
        // Handle other pages' animations
        const elementsToAnimate = document.querySelectorAll(
            '.nav-item, .feature-item, .timeline-item, .cta-section, ' + 
            '.guide-section, .qa-item, .info-card, .image-gallery, .guide-img, .bullet-list li'
        );
        
        elementsToAnimate.forEach(element => {
            element.classList.add('hidden');
            scrollObserver.observe(element);
        });
    }

    // Set copyright year
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Clear all animation flags when the browser is refreshed (not on normal navigation)
    window.addEventListener('beforeunload', function(e) {
        // The presence of returnValue indicates a page refresh rather than navigation
        if (e.returnValue !== undefined) {
            // Clear all animation flags on page refresh
            Object.keys(sessionStorage).forEach(key => {
                if (key.startsWith('animations_')) {
                    sessionStorage.removeItem(key);
                }
            });
        }
    });
}); 