/**
 * Script to remove back-to-top buttons and audio elements
 * This script runs on page load to clean up these elements
 */
document.addEventListener('DOMContentLoaded', function() {
    // Remove back-to-top buttons
    const backToTopElements = document.querySelectorAll('.back-to-top, #backToTop');
    backToTopElements.forEach(element => {
        if (element) {
            element.remove();
        }
    });
    
    // Remove audio toggle buttons
    const audioControls = document.querySelectorAll('.audio-toggle, .audio-controls');
    audioControls.forEach(element => {
        if (element) {
            element.remove();
        }
    });
    
    // Remove background music elements
    const backgroundMusic = document.getElementById('backgroundMusic');
    if (backgroundMusic) {
        backgroundMusic.remove();
    }
    
    // Remove any remaining audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(element => {
        element.remove();
    });
    
    // Remove any related event listeners
    document.querySelectorAll('button, a').forEach(el => {
        if (el.id === 'toggleAudio' || el.classList.contains('audio-toggle')) {
            el.remove();
        }
    });
    
    // Also fix any remaining margins to ensure no space below footer
    const html = document.documentElement;
    const body = document.body;
    
    // Force body to fill viewport
    body.style.minHeight = '100vh';
    body.style.margin = '0';
    body.style.padding = '0';
    
    // Ensure footer stays at bottom with no extra space
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.marginBottom = '0';
    }
}); 