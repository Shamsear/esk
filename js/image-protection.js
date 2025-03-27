/**
 * Image Protection Script
 * Prevents image zooming, clicking, and right-click functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS to prevent touch actions at the beginning to avoid flickering
    const style = document.createElement('style');
    style.innerHTML = `
        img {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            pointer-events: none !important;
        }
        
        body {
            touch-action: pan-x pan-y;
        }
    `;
    document.head.appendChild(style);
    
    // Disable image dragging without cloning
    const allImages = document.querySelectorAll('img');
    allImages.forEach(img => {
        // Prevent dragging
        img.setAttribute('draggable', 'false');
        
        // Set cursor to default
        img.style.cursor = 'default';
        
        // Prevent context menu
        img.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    });
    
    // Prevent pinch zoom on mobile
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Prevent zoom by Ctrl + wheel
    document.addEventListener('wheel', function(e) {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Prevent right-click on entire document
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });
    
    // Disable image click modal functionality in tournament guide only
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', function() {
                imageModal.style.display = "none";
            });
        }
        
        // Prevent image click event in tournament guide only
        const guideImages = document.querySelectorAll('.guide-img');
        if (guideImages.length > 0) {
            guideImages.forEach(img => {
                const newImg = img.cloneNode(true);
                img.parentNode.replaceChild(newImg, img);
            });
        }
    }
}); 