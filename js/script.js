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

    // Image optimization code
    function optimizeImageLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageOptions = {
            root: null,
            rootMargin: '50px 0px', // Start loading images before they enter viewport
            threshold: 0.1
        };

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, imageOptions);

        function loadImage(image) {
            const src = image.getAttribute('data-src');
            if (!src) return;

            // Preload image
            const preloadImage = new Image();
            preloadImage.src = src;
            preloadImage.onload = () => {
                image.src = src;
                image.classList.add('loaded');
            };
            image.removeAttribute('data-src');
        }

        // Convert all images to lazy loading
        images.forEach(img => {
            // Save original src as data-src
            if (!img.getAttribute('data-src')) {
                img.setAttribute('data-src', img.src);
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
            }
            imageObserver.observe(img);
        });

        // Preload visible images immediately
        const visibleImages = Array.from(images).filter(img => {
            const rect = img.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom >= 0;
        });

        visibleImages.forEach(loadImage);
    }

    // Get current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Enhanced Intersection Observer options for faster animations
    const observerOptions = {
        root: null,
        rootMargin: '50px',
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1]
    };
    
    // Function to check if element is in viewport with larger margin
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.95 && 
            rect.bottom >= -50 // Allow elements slightly above viewport
        );
    }
    
    // Create Intersection Observer for faster scroll animations
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.target.classList.contains('animate-in')) {
                const progress = Math.min(entry.intersectionRatio * 2, 1); // Faster progress
                
                if (progress > 0) {
                    entry.target.style.opacity = progress;
                    // Reduced movement distance and faster scale
                    entry.target.style.transform = `translateY(${20 * (1 - progress)}px) scale(${0.98 + (0.02 * progress)})`;
                    
                    if (progress >= 0.8) { // Trigger animation earlier
                        entry.target.classList.add('animate-in');
                        entry.target.style.transform = 'none';
                        observer.unobserve(entry.target);
                    }
                }
            }
        });
    }, observerOptions);

    // Function to set up faster scroll animations
    function setupScrollAnimations(elements, staggerDelay = 0.05) { // Reduced default stagger delay
        elements.forEach((element, index) => {
            element.classList.add('hidden');
            
            const rect = element.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const delayMultiplier = rect.top < viewportHeight ? staggerDelay : staggerDelay / 2;
            
            // Faster transition delay
            element.style.transitionDelay = `${index * delayMultiplier}s`;
            element.style.transitionDuration = '0.4s'; // Faster transition duration
            
            scrollObserver.observe(element);
            
            // Clean up transitions after animation
            element.addEventListener('transitionend', () => {
                if (element.classList.contains('animate-in')) {
                    element.style.transitionDelay = '0s';
                    element.style.transitionDuration = '0.3s'; // Faster hover transitions
                }
            });
        });
    }

    // Function to handle page-specific animations with optimized timing
    function initializePageAnimations() {
        // Initialize image optimization first
        optimizeImageLoading();

        switch(currentPage) {
            case 'registered-clubs.html':
                const clubElements = [
                    ...document.querySelectorAll('.black-box'),
                    ...document.querySelectorAll('.club-info'),
                    ...document.querySelectorAll('.moze-gallery li'),
                    ...document.querySelectorAll('.gallery-loader'),
                    ...document.querySelectorAll('.search-box')
                ];
                setupScrollAnimations(clubElements, 0.03); // Very fast stagger for many items
                break;

            case 'manager-ranking.html':
                const managerElements = [
                    ...document.querySelectorAll('.black-box'),
                    ...document.querySelectorAll('.club-info'),
                    ...document.querySelectorAll('.moze-gallery li'),
                    ...document.querySelectorAll('.gallery-loader')
                ];
                setupScrollAnimations(managerElements, 0.04);
                break;
                
            case 'trophy-cabinet.html':
                const trophyElements = [
                    ...document.querySelectorAll('.club-info'),
                    ...document.querySelectorAll('.stat-item'),
                    ...document.querySelectorAll('.season-box'),
                    ...document.querySelectorAll('.moze-gallery li')
                ];
                setupScrollAnimations(trophyElements, 0.04);
                
                // Optimized season content animations
                document.querySelectorAll('.season-content').forEach(content => {
                    const seasonElements = [
                        ...content.querySelectorAll('.club-info'),
                        ...content.querySelectorAll('.textbox'),
                        ...content.querySelectorAll('p'),
                        ...content.querySelectorAll('.moze-gallery li')
                    ];
                    seasonElements.forEach(element => {
                        element.classList.add('hidden');
                        element.style.transitionDuration = '0.4s';
                    });
                });
                break;
                
            case 'career-tournament.html':
                const tournamentElements = [
                    ...document.querySelectorAll('.tournament-card'),
                    ...document.querySelectorAll('.black-box')
                ];
                setupScrollAnimations(tournamentElements, 0.04);
                break;
                
            default:
                const elementsToAnimate = document.querySelectorAll(
                    '.nav-item, .feature-item, .timeline-item, .cta-section, ' + 
                    '.guide-section, .qa-item, .info-card, .image-gallery, .guide-img, .bullet-list li'
                );
                setupScrollAnimations(elementsToAnimate, 0.05);
        }
    }

    // Initialize animations
    initializePageAnimations();
    
    // Optimized scroll handler with reduced calculations
    let scrollTimeout;
    let lastScroll = 0;
    const scrollThreshold = 50; // Only process every 50ms

    window.addEventListener('scroll', () => {
        const now = Date.now();
        if (now - lastScroll < scrollThreshold) return;
        lastScroll = now;

        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        
        scrollTimeout = window.requestAnimationFrame(() => {
            const hiddenElements = document.querySelectorAll('.hidden:not(.animate-in)');
            if (hiddenElements.length > 0) {
                hiddenElements.forEach(element => {
                    if (isInViewport(element)) {
                        element.classList.add('animate-in');
                    }
                });
            }
        });
    }, { passive: true }); // Optimize scroll performance

    // Set copyright year
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Calculate scrollbar width once
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    
    // Modal functionality
    const modals = document.querySelectorAll('.modal');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    
    // Function to open modal
    function openModal(modal, overlay) {
        // Prevent body scroll and adjust for scrollbar removal
        document.body.classList.add('modal-open');
        
        // Show modal and overlay with a slight delay to ensure smooth animation
        requestAnimationFrame(() => {
            modal.classList.add('active');
            overlay.classList.add('active');
        });
    }
    
    // Function to close modal
    function closeModal(modal, overlay) {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        
        // Remove body scroll lock after animation
        setTimeout(() => {
            if (!document.querySelector('.modal.active')) {
                document.body.classList.remove('modal-open');
            }
        }, 300); // Match transition duration
    }
    
    // Set up modal triggers
    document.querySelectorAll('[data-modal-target]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal-target');
            const modal = document.querySelector(modalId);
            const overlay = modal.nextElementSibling;
            
            if (modal && overlay) {
                openModal(modal, overlay);
            }
        });
    });
    
    // Close modal on close button click
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            const overlay = modal.nextElementSibling;
            closeModal(modal, overlay);
        });
    });
    
    // Close modal on overlay click
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            const modal = overlay.previousElementSibling;
            closeModal(modal, overlay);
        });
    });
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            const activeOverlay = document.querySelector('.modal-overlay.active');
            if (activeModal && activeOverlay) {
                closeModal(activeModal, activeOverlay);
            }
        }
    });
}); 