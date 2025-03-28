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
    
    // Optimized Intersection Observer options for faster animations
    const observerOptions = {
        root: null,
        rootMargin: '50px', // Increased margin to start animations earlier
        threshold: [0, 0.25, 0.5, 0.75, 1] // Reduced number of thresholds for better performance
    };
    
    // Function to check if element is in viewport (optimized)
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }
    
    // Create Intersection Observer for scroll animations (optimized)
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.target.classList.contains('animate-in')) {
                if (entry.isIntersecting) {
                    // Simplified animation logic for better performance
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'none';
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                    
                    // Remove transition delay after animation
                    setTimeout(() => {
                        entry.target.style.transitionDelay = '0s';
                    }, 300);
                }
            }
        });
    }, observerOptions);

    // Function to set up scroll animations for elements (optimized)
    function setupScrollAnimations(elements, staggerDelay = 0.05) { // Reduced default stagger delay
        elements.forEach((element, index) => {
            if (element.classList.contains('animate-in')) return;
            
            // Add initial hidden state with optimized transform
            element.classList.add('hidden');
            element.style.transform = 'translateY(20px)'; // Reduced initial offset
            element.style.opacity = '0';
            
            // Faster transition delay calculation
            const delayMultiplier = isInViewport(element) ? staggerDelay : staggerDelay / 2;
            element.style.transitionDelay = `${index * delayMultiplier}s`;
            
            // Start observing
            scrollObserver.observe(element);
        });
    }

    // Function to handle page-specific animations (optimized)
    function initializePageAnimations() {
        const commonDelay = 0.03; // Faster stagger delay for all pages
        
        switch(currentPage) {
            case 'registered-clubs.html':
            case 'manager-ranking.html':
                const galleryElements = [
                    ...document.querySelectorAll('.black-box'),
                    ...document.querySelectorAll('.club-info'),
                    ...document.querySelectorAll('.moze-gallery li'),
                    ...document.querySelectorAll('.gallery-loader'),
                    ...document.querySelectorAll('.search-box')
                ];
                setupScrollAnimations(galleryElements, commonDelay);
                break;
                
            case 'trophy-cabinet.html':
                const trophyElements = [
                    ...document.querySelectorAll('.club-info'),
                    ...document.querySelectorAll('.stat-item'),
                    ...document.querySelectorAll('.season-box'),
                    ...document.querySelectorAll('.moze-gallery li')
                ];
                setupScrollAnimations(trophyElements, commonDelay);
                
                // Optimized season content handling
                document.querySelectorAll('.season-content').forEach(content => {
                    const seasonElements = content.querySelectorAll('.club-info, .textbox, p, .moze-gallery li');
                    seasonElements.forEach(element => element.classList.add('hidden'));
                });
                break;
                
            case 'career-tournament.html':
                const tournamentElements = [
                    ...document.querySelectorAll('.tournament-card'),
                    ...document.querySelectorAll('.black-box')
                ];
                setupScrollAnimations(tournamentElements, commonDelay);
                break;
                
            default:
                const elementsToAnimate = document.querySelectorAll(
                    '.nav-item, .feature-item, .timeline-item, .cta-section, ' + 
                    '.guide-section, .qa-item, .info-card, .image-gallery, .guide-img, .bullet-list li'
                );
                setupScrollAnimations(elementsToAnimate, commonDelay);
        }
    }

    // Initialize animations
    initializePageAnimations();
    
    // Optimized scroll handler
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
                        element.style.opacity = '1';
                        element.style.transform = 'none';
                        element.classList.add('animate-in');
                    }
                });
            }
        });
    }, { passive: true }); // Add passive flag for better scroll performance

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