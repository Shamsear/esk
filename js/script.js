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

    // Scroll animations using Intersection Observer
    const animateOnScroll = function() {
        // Elements to animate - including tournament guide elements and manager ranking elements
        const elementsToAnimate = document.querySelectorAll(
            '.nav-item, .feature-item, .timeline-item, .cta-section, ' + 
            '.guide-section, .qa-item, .info-card, .image-gallery, .guide-img, .bullet-list li, ' +
            '.black-box, .club-info, .moze-gallery li, .gallery-loader, .season-box, .centered-box, ' +
            '.stat-item, .stats-preview'
        );
        
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
    };

    // Set copyright year
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Initialize animations
    animateOnScroll();
    
    // Trophy Cabinet - Collapsible season sections
    const seasonBoxes = document.querySelectorAll('.season-box');
    
    if (seasonBoxes.length > 0) {
        // Initially all seasons should be collapsed
        const seasonContents = document.querySelectorAll('.season-content');
        seasonContents.forEach(content => {
            content.classList.remove('active');
        });
        
        seasonBoxes.forEach(box => {
            box.classList.remove('active');
        });
        
        // Add click event listeners to all season boxes
        seasonBoxes.forEach(box => {
            box.addEventListener('click', function() {
                const seasonId = this.getAttribute('data-season');
                const seasonContent = document.getElementById(seasonId + '-content');
                
                // Toggle current season
                this.classList.toggle('active');
                
                if (seasonContent) {
                    seasonContent.classList.toggle('active');
                    
                    // Smooth scroll to the season box if it's being opened
                    if (seasonContent.classList.contains('active')) {
                        // Add a slight bounce effect to the season box
                        this.style.transform = 'scale(1.08)';
                        setTimeout(() => {
                            this.style.transform = 'scale(1.03)';
                        }, 150);
                        
                        // Slight delay to allow animation to start
                        setTimeout(() => {
                            this.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                    }
                }
                
                // Close all other seasons
                seasonBoxes.forEach(otherBox => {
                    if (otherBox !== this) {
                        const otherSeasonId = otherBox.getAttribute('data-season');
                        const otherContent = document.getElementById(otherSeasonId + '-content');
                        
                        otherBox.classList.remove('active');
                        if (otherContent) {
                            otherContent.classList.remove('active');
                        }
                    }
                });
            });
        });
    }
}); 