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

    // Get current page to set unique animation flag
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Special handling for index and career pages to avoid delayed animations
    const isIndexOrCareer = currentPage === 'index.html' || currentPage === 'career-mode.html';
    
    // Handle animations differently based on page type
    if (isIndexOrCareer) {
        // For index and career pages, immediately show all elements
        const elements = document.querySelectorAll(
            '.nav-item, .feature-item, .timeline-item, .cta-section'
        );
        
        elements.forEach(element => {
            // Make sure elements are visible immediately
            element.classList.remove('hidden');
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.style.transition = 'none';
        });
    } else {
        // For other pages, use the normal animation system
        const animationKey = 'animations_' + currentPage;
        const animationsApplied = sessionStorage.getItem(animationKey);
        
        // Scroll animations using Intersection Observer
        const animateOnScroll = function() {
            // Don't animate again if already animated for this page
            if (animationsApplied === 'true') {
                console.log('Animations already applied for ' + currentPage);
                
                // Remove hidden class from all elements to ensure they're visible
                const elementsToShow = document.querySelectorAll(
                    '.nav-item, .feature-item, .timeline-item, .cta-section, ' + 
                    '.guide-section, .qa-item, .info-card, .image-gallery, .guide-img, .bullet-list li'
                );
                
                elementsToShow.forEach(element => {
                    element.classList.remove('hidden');
                    element.classList.add('animate-in');
                });
                
                return;
            }
            
            // Elements to animate - including tournament guide elements
            // IMPORTANT: Exclude season-content elements to avoid conflicts with trophy cabinet
            const elementsToAnimate = document.querySelectorAll(
                '.nav-item, .feature-item, .timeline-item, .cta-section, ' + 
                '.guide-section, .qa-item, .info-card, .image-gallery, .guide-img, .bullet-list li'
            );
            
            // Special handling for trophy cabinet elements
            if (currentPage === 'trophy-cabinet.html') {
                // Make sure hidden season contents don't interfere with animations
                document.querySelectorAll('.season-content').forEach(content => {
                    if (!content.classList.contains('active')) {
                        content.style.display = 'none';
                    } else {
                        content.style.display = 'block';
                        content.style.opacity = '1';
                        content.style.transform = 'translateY(0)';
                    }
                });
            }
            
            // Intersection Observer options
            const options = {
                root: null, // viewport is the root
                rootMargin: '0px',
                threshold: 0.1 // 10% of the element must be visible
            };
            
            // Create observer
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        // Stop observing after animation
                        observer.unobserve(entry.target);
                    }
                });
            }, options);
            
            // Start observing elements
            elementsToAnimate.forEach(element => {
                observer.observe(element);
                // Add initial hidden state class
                element.classList.add('hidden');
            });
            
            // Set flag to prevent re-animation for this specific page
            sessionStorage.setItem(animationKey, 'true');
        };
        
        // Initialize animations for non-index/career pages
        animateOnScroll();
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