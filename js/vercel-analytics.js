/**
 * Vercel Analytics Integration
 * This script integrates Vercel Web Analytics for tracking page views and user interactions
 * Documentation: https://vercel.com/docs/analytics
 */

// Add the Vercel Analytics script
(function() {
  // Vercel Analytics snippet (from Vercel documentation)
  const vercelAnalyticsScript = document.createElement('script');
  vercelAnalyticsScript.defer = true;
  vercelAnalyticsScript.dataset.appid = 'prj_zay0W2jm2U9RmCM9ujPjcYg8M9vq';
  vercelAnalyticsScript.src = '/_vercel/insights/script.js';
  
  // Append to head if document is loaded, otherwise wait for DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      document.head.appendChild(vercelAnalyticsScript);
      console.log('Vercel Analytics initialized (after DOM loaded)');
    });
  } else {
    document.head.appendChild(vercelAnalyticsScript);
    console.log('Vercel Analytics initialized (immediate)');
  }
})(); 