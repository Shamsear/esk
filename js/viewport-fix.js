// Fix for mobile viewport height issues
function setVh() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set the height on page load
window.addEventListener('load', setVh);

// Update on resize and orientation change
window.addEventListener('resize', setVh);
window.addEventListener('orientationchange', setVh);

// Initial set
setVh();

// Fix for iOS overflow issues
document.addEventListener('gesturestart', function (e) {
  e.preventDefault();
});

// Fix for sticky elements
window.addEventListener('scroll', function() {
  // Reset position if needed
  document.documentElement.style.scrollBehavior = 'smooth';
});