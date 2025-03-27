/**
 * Career Tournament Page Specific Fixes
 * Ensures content is fully visible and scrollable
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Career Tournament Page Fix loaded');
    
    // Ensure mobile menu is hidden
    const hideMobileMenu = () => {
        // Hide mobile menu
        const mobileMenu = document.getElementById('mobileMenu');
        const menuToggle = document.getElementById('menuToggle');
        
        if (mobileMenu) {
            mobileMenu.style.display = 'none';
            mobileMenu.style.visibility = 'hidden';
            mobileMenu.style.opacity = '0';
            mobileMenu.style.transform = 'translateX(100%)';
            mobileMenu.style.pointerEvents = 'none';
        }
        
        if (menuToggle) {
            menuToggle.style.display = 'none';
            menuToggle.style.visibility = 'hidden';
            menuToggle.style.opacity = '0';
            menuToggle.style.pointerEvents = 'none';
        }
        
        // Hide all hamburger elements
        document.querySelectorAll('.hamburger').forEach(el => {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
        });
    };
    
    // Set up scroll animations
    const setupScrollAnimations = () => {
        const animatedElements = document.querySelectorAll('.tournament-card, .black-box');
        
        // Add hidden class to all elements initially
        animatedElements.forEach(el => {
            el.classList.add('hidden');
        });
        
        // Check if element is in viewport
        function isInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.9 && 
                rect.bottom >= 0
            );
        }
        
        // Function to check elements and animate them if in viewport
        function checkElements() {
            animatedElements.forEach(el => {
                if (isInViewport(el) && el.classList.contains('hidden')) {
                    el.classList.add('animate-in');
                }
            });
        }
        
        // Run on initial load with a delay
        setTimeout(checkElements, 300);
        
        // Add scroll event listener
        window.addEventListener('scroll', checkElements);
    };
    
    // Add scroll animation styles
    const addScrollAnimationStyles = () => {
        // Create a style element for animations
        const animationStyle = document.createElement('style');
        animationStyle.setAttribute('data-animation-styles', 'true');
        
        // Define animation styles
        animationStyle.textContent = `
            .hidden {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease-out, transform 0.6s ease-out;
            }
            
            .animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .tournament-card.hidden {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease-out, transform 0.6s ease-out;
            }
            
            .black-box.hidden {
                opacity: 0;
                transform: translateY(-15px);
                transition: opacity 0.5s ease-out, transform 0.5s ease-out;
            }
            
            /* Staggered delays for tournament cards */
            .tournament-card:nth-child(3n+1) { transition-delay: 0.1s; }
            .tournament-card:nth-child(3n+2) { transition-delay: 0.2s; }
            .tournament-card:nth-child(3n+3) { transition-delay: 0.3s; }
        `;
        
        // Add the style to the document head
        document.head.appendChild(animationStyle);
    };
    
    // Fix iOS height issues
    const setDocHeight = () => {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        document.body.style.minHeight = 'auto';
    };
    
    // Initialize in the correct order
    const initialize = () => {
        // First hide the mobile menu
        hideMobileMenu();
        
        // Fix height issues
        setDocHeight();
        
        // Add animation styles
        addScrollAnimationStyles();
        
        // Set up animations
        setupScrollAnimations();
        
        // Override any event listeners that might show the mobile menu
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }, true);
        }
    };
    
    // Run initialization
    initialize();
    
    // Make sure mobile menu stays hidden even after other scripts run
    setTimeout(hideMobileMenu, 100);
    setTimeout(hideMobileMenu, 500);
    
    // Re-run on resize and orientation change
    window.addEventListener('resize', () => {
        setDocHeight();
        hideMobileMenu();
    });
    
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            setDocHeight();
            hideMobileMenu();
        }, 200);
    });
    
    // Make sure all content is loaded and mobile menu stays hidden
    window.addEventListener('load', () => {
        hideMobileMenu();
    });
}); 