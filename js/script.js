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
    
    // Enhanced Intersection Observer options for smoother animations
    const observerOptions = {
        root: null,
        rootMargin: '30px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
    };
    
    // Function to check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.9 && 
            rect.bottom >= 0
        );
    }
    
    // Create Intersection Observer for scroll animations
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.target.classList.contains('animate-in')) {
                const progress = Math.min(entry.intersectionRatio * 1.5, 1);
                
                if (progress > 0) {
                    entry.target.style.opacity = progress;
                    entry.target.style.transform = `translateY(${30 * (1 - progress)}px) scale(${0.95 + (0.05 * progress)})`;
                    
                    if (progress >= 1) {
                        entry.target.classList.add('animate-in');
                        entry.target.style.transform = 'none';
                        observer.unobserve(entry.target);
                    }
                }
            }
        });
    }, observerOptions);

    // Function to set up scroll animations for elements
    function setupScrollAnimations(elements, staggerDelay = 0.1) {
        elements.forEach((element, index) => {
            // Add initial hidden state
            element.classList.add('hidden');
            
            // Calculate staggered delay based on position
            const rect = element.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const delayMultiplier = rect.top < viewportHeight ? staggerDelay : staggerDelay / 2;
            
            // Add staggered delay
            element.style.transitionDelay = `${index * delayMultiplier}s`;
            
            // Start observing
            scrollObserver.observe(element);
            
            // Reset transition delay after animation
            element.addEventListener('transitionend', () => {
                if (element.classList.contains('animate-in')) {
                    element.style.transitionDelay = '0s';
                }
            });
        });
    }

    // Function to handle page-specific animations
    function initializePageAnimations() {
        switch(currentPage) {
            case 'registered-clubs.html':
                const clubElements = [
                    ...document.querySelectorAll('.black-box'),
                    ...document.querySelectorAll('.club-info'),
                    ...document.querySelectorAll('.moze-gallery li'),
                    ...document.querySelectorAll('.gallery-loader'),
                    ...document.querySelectorAll('.search-box')
                ];
                setupScrollAnimations(clubElements, 0.08); // Slightly faster stagger for many club items
                break;

            case 'manager-ranking.html':
                const managerElements = [
                    ...document.querySelectorAll('.black-box'),
                    ...document.querySelectorAll('.club-info'),
                    ...document.querySelectorAll('.moze-gallery li'),
                    ...document.querySelectorAll('.gallery-loader')
                ];
                setupScrollAnimations(managerElements);
                break;
                
            case 'trophy-cabinet.html':
                const trophyElements = [
                    ...document.querySelectorAll('.club-info'),
                    ...document.querySelectorAll('.stat-item'),
                    ...document.querySelectorAll('.season-box'),
                    ...document.querySelectorAll('.moze-gallery li')
                ];
                setupScrollAnimations(trophyElements);
                
                // Special handling for season content animations
                document.querySelectorAll('.season-content').forEach(content => {
                    const seasonElements = [
                        ...content.querySelectorAll('.club-info'),
                        ...content.querySelectorAll('.textbox'),
                        ...content.querySelectorAll('p'),
                        ...content.querySelectorAll('.moze-gallery li')
                    ];
                    seasonElements.forEach(element => element.classList.add('hidden'));
                });
                break;
                
            case 'career-tournament.html':
                const tournamentElements = [
                    ...document.querySelectorAll('.tournament-card'),
                    ...document.querySelectorAll('.black-box')
                ];
                setupScrollAnimations(tournamentElements);
                break;
                
            default:
                // Handle other pages' animations
                const elementsToAnimate = document.querySelectorAll(
                    '.nav-item, .feature-item, .timeline-item, .cta-section, ' + 
                    '.guide-section, .qa-item, .info-card, .image-gallery, .guide-img, .bullet-list li'
                );
                setupScrollAnimations(elementsToAnimate);
        }
    }

    // Initialize animations
    initializePageAnimations();
    
    // Re-run animation setup on scroll to handle dynamic content
    let scrollTimeout;
    window.addEventListener('scroll', () => {
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
    });

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