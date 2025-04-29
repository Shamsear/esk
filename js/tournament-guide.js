/**
 * Tournament Guide Accordion and Interactive Features
 */
document.addEventListener('DOMContentLoaded', function() {
    // Plain simple accordion functionality
    var questionButtons = document.querySelectorAll('.question');
    
    for (var i = 0; i < questionButtons.length; i++) {
        questionButtons[i].addEventListener('click', function() {
            var qaItem = this.parentNode;
            var isActive = qaItem.classList.contains('active');
            
            // Close all first
            var allItems = document.querySelectorAll('.qa-item');
            for (var j = 0; j < allItems.length; j++) {
                allItems[j].classList.remove('active');
            }
            
            // If wasn't active, make it active
            if (!isActive) {
                qaItem.classList.add('active');
            }
        });
    }
    
    // Fix image paths to ensure they display correctly
    var images = document.querySelectorAll('.guide-img');
    
    // Fix image paths if needed - this helps with image display issues
    images.forEach(function(img) {
        // Check for relative path issues
        if (img.src.includes('../assets/')) {
            img.src = img.src.replace('../assets/', 'assets/');
        }
        
        // Force image reload to fix display issues
        const currentSrc = img.src;
        img.src = '';
        setTimeout(() => {
            img.src = currentSrc;
        }, 10);
    });
    
    // Ensure the modal is disabled and not interfering
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = "none";
    }
    
    // Back to top button functionality
    var backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}); 