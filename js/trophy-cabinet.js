/**
 * Trophy Cabinet Script
 * Handles the expandable season boxes functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get all season boxes
    const seasonBoxes = document.querySelectorAll('.season-box');
    
    // Initialize each season box with click functionality
    seasonBoxes.forEach(box => {
        // Get the associated content section
        const seasonId = box.getAttribute('data-season');
        const contentSection = document.getElementById(seasonId + '-content');
        
        if (contentSection) {
            // Initially hide all content sections (redundant with CSS but ensures it works)
            contentSection.style.display = 'none';
            contentSection.classList.remove('active');
            
            // Add click event handler
            box.addEventListener('click', function(e) {
                // Prevent event bubbling
                e.preventDefault();
                e.stopPropagation();
                
                // Toggle active classes
                const wasActive = box.classList.contains('active');
                
                // First close all sections
                seasonBoxes.forEach(otherBox => {
                    // Skip the current box
                    if (otherBox !== box) {
                        otherBox.classList.remove('active');
                        const otherId = otherBox.getAttribute('data-season');
                        const otherContent = document.getElementById(otherId + '-content');
                        if (otherContent) {
                            otherContent.classList.remove('active');
                            otherContent.style.display = 'none';
                        }
                    }
                });
                
                // Then toggle the current section
                if (!wasActive) {
                    // Open this section
                    box.classList.add('active');
                    contentSection.classList.add('active');
                    contentSection.style.display = 'block';
                    
                    // Scroll to the section after a small delay to allow animation
                    setTimeout(() => {
                        box.scrollIntoView({behavior: 'smooth', block: 'start'});
                    }, 100);
                    
                    // Initialize animations for items within the expanded section
                    animateContentItems(contentSection);
                } else {
                    // Close this section
                    box.classList.remove('active');
                    contentSection.classList.remove('active');
                    contentSection.style.display = 'none';
                }
            });
        }
    });
    
    // Function to animate items within content when expanded
    function animateContentItems(contentSection) {
        // Get all items that should be animated
        const galleryItems = contentSection.querySelectorAll('.moze-gallery li');
        const infoBoxes = contentSection.querySelectorAll('.club-info');
        const statItems = contentSection.querySelectorAll('.stat-item');
        
        // Reset and prepare all items for animation
        function prepareForAnimation(items, delay) {
            items.forEach((item, index) => {
                // Reset animation classes
                item.classList.remove('animate-in');
                item.classList.add('hidden');
                
                // Force reflow
                void item.offsetWidth;
                
                // Add animation class with calculated delay
                setTimeout(() => {
                    item.classList.add('animate-in');
                }, delay + (index * 50)); // Staggered delay
            });
        }
        
        // Apply animations with staggered timing
        prepareForAnimation(infoBoxes, 100);
        prepareForAnimation(galleryItems, 200);
        prepareForAnimation(statItems, 300);
    }
    
    // Check for hash in URL to automatically open a specific season
    function checkHashAndOpenSection() {
        const hash = window.location.hash;
        if (hash) {
            const seasonId = hash.substring(1); // Remove the # symbol
            const seasonBox = document.querySelector(`.season-box[data-season="${seasonId}"]`);
            
            if (seasonBox) {
                // Simulate a click to open the section
                setTimeout(() => {
                    // Create and dispatch a click event
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    seasonBox.dispatchEvent(clickEvent);
                }, 300); // Small delay to ensure page is fully loaded
            }
        }
    }
    
    // Run hash check on page load with a small delay to ensure everything is ready
    setTimeout(checkHashAndOpenSection, 100);
    
    // Listen for hash changes
    window.addEventListener('hashchange', checkHashAndOpenSection);
    
    // Debug logging (remove in production)
    console.log('Trophy Cabinet Script loaded successfully');
}); 