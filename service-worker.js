// Service Worker for caching and offline functionality
const CACHE_NAME = 'r2g-cache-v2';
const IMG_CACHE_NAME = 'r2g-images-v2';
const STATIC_CACHE_NAME = 'r2g-static-v2';

// Assets that should be cached immediately during installation
const CRITICAL_ASSETS = [
  './',
  'index.html',
  'offline.html',
  'css/critical.css',
  'js/performance.js',
  'assets/images/logo11.webp'
];

// Assets that should be cached during installation but are not critical for initial render
const STATIC_ASSETS = [
  'career-mode.html',
  'career-tournament.html',
  'manager-ranking.html',
  'registered-clubs.html',
  'trophy-cabinet.html',
  'tournament-guide.html',
  'css/styles.css',
  'js/script.js',
  'js/image-optimization.js'
];

// Cache critical resources during installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      })
      .then(() => {
        // Cache non-critical assets in the background
        return caches.open(STATIC_CACHE_NAME)
          .then(cache => {
            console.log('Caching static assets in the background');
            // Use a background sync pattern with Promise.allSettled to continue even if some assets fail
            return Promise.allSettled(STATIC_ASSETS.map(url => {
              return fetch(url, { cache: 'no-cache' })
                .then(response => {
                  if (response.ok) {
                    return cache.put(url, response);
                  }
                  console.warn(`Failed to cache: ${url}`);
                })
                .catch(error => {
                  console.warn(`Failed to fetch for caching: ${url}`, error);
                });
            }));
          });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate and clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, IMG_CACHE_NAME, STATIC_CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!currentCaches.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Helper function to determine if a request is for an image
function isImageRequest(request) {
  return request.destination === 'image' || 
         request.url.match(/\.(jpe?g|png|gif|svg|webp)$/i);
}

// Helper function to check if a request should be cached
function shouldCache(url) {
  // Skip analytics, tracking, and API calls
  if (url.includes('/api/') || url.includes('/analytics/') || url.includes('/track/')) {
    return false;
  }
  
  // Skip large JSON files
  if (url.includes('players.json')) {
    return false;
  }
  
  return true;
}

// Convert non-WebP image URL to WebP
function convertToWebP(url) {
  if (url.match(/\.(jpe?g|png|gif)$/i)) {
    return url.replace(/\.(jpe?g|png|gif)$/i, '.webp');
  }
  return url;
}

// Network-first strategy with timeout fallback
async function networkFirstWithTimeout(request, timeout = 3000) {
  return new Promise(resolve => {
    let timeoutId;
    
    // Create a timeout promise
    const timeoutPromise = new Promise(resolveTimeout => {
      timeoutId = setTimeout(() => {
        resolveTimeout('TIMEOUT');
      }, timeout);
    });
    
    // Try network first
    fetch(request.clone())
      .then(networkResponse => {
        clearTimeout(timeoutId);
        
        // Cache successful responses
        if (networkResponse.ok && shouldCache(request.url)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
        }
        
        resolve(networkResponse);
      })
      .catch(err => {
        clearTimeout(timeoutId);
        console.log('Network fetch failed, falling back to cache');
        resolve(caches.match(request));
      });
    
    // If timeout occurs, try cache
    timeoutPromise.then(result => {
      if (result === 'TIMEOUT') {
        console.log('Network request timed out, falling back to cache');
        resolve(caches.match(request));
      }
    });
  });
}

// Handle fetch events with appropriate strategies
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Get the URL for easier pattern matching
  const requestUrl = new URL(event.request.url);
  
  // Special handling for navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      networkFirstWithTimeout(event.request)
        .then(response => {
          return response || caches.match('offline.html');
        })
    );
    return;
  }
  
  // Special handling for image requests
  if (isImageRequest(event.request)) {
    // For non-WebP images, try to serve WebP version instead
    const isWebP = event.request.url.endsWith('.webp');
    
    // Create WebP request if original is not WebP
    let webpRequest = event.request;
    if (!isWebP) {
      const webpUrl = convertToWebP(event.request.url);
      webpRequest = new Request(webpUrl);
    }
    
    event.respondWith(
      caches.open(IMG_CACHE_NAME)
        .then(cache => {
          // First try to match the WebP version
          return cache.match(webpRequest)
            .then(cachedResponse => {
              // If WebP version is in cache, return it
              if (cachedResponse) {
                // Refresh cache in background
                fetch(webpRequest)
                  .then(networkResponse => {
                    if (networkResponse.ok) {
                      cache.put(webpRequest, networkResponse.clone());
                    }
                  })
                  .catch(() => { /* Silently fail background refresh */ });
                  
                return cachedResponse;
              }
              
              // If not in cache, try network for WebP version
              return fetch(webpRequest)
                .then(networkResponse => {
                  if (networkResponse.ok) {
                    cache.put(webpRequest, networkResponse.clone());
                    return networkResponse;
                  }
                  
                  // If WebP fetch failed and original wasn't WebP, try original
                  if (!isWebP) {
                    return fetch(event.request)
                      .then(origResponse => {
                        if (origResponse.ok) {
                          cache.put(event.request, origResponse.clone());
                          return origResponse;
                        }
                        throw new Error('Both WebP and original fetch failed');
                      });
                  }
                  
                  throw new Error('WebP fetch failed');
                })
                .catch(err => {
                  console.log('Image fetch failed:', err);
                  return caches.match('assets/images/placeholder.webp')
                    .catch(() => new Response('Image not found', { status: 404 }));
                });
            });
        })
    );
    return;
  }
  
  // For other assets (CSS, JS, etc.) use stale-while-revalidate
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if available and refresh in background
        if (cachedResponse) {
          // Refresh cache in background
          if (shouldCache(event.request.url)) {
            fetch(event.request)
              .then(networkResponse => {
                if (networkResponse.ok) {
                  caches.open(CACHE_NAME)
                    .then(cache => cache.put(event.request, networkResponse));
                }
              })
              .catch(() => {});
          }
          
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Cache new version if it's a successful response and cacheable
            if (networkResponse.ok && shouldCache(event.request.url)) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(err => {
            console.log('Fetch failed:', err);
            
            // For JS/CSS files that might have fallbacks
            if (event.request.destination === 'script' || event.request.destination === 'style') {
              // Try to serve a cached version of any script or stylesheet
              return caches.match(event.request, { ignoreSearch: true })
                .then(wildcardMatch => wildcardMatch || Response.error());
            }
            
            return Response.error();
          });
      })
  );
});

// Background sync for saving data when offline
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Periodic cache update for frequently accessed resources
self.addEventListener('periodicsync', event => {
  if (event.tag === 'refresh-content') {
    event.waitUntil(refreshFrequentlyAccessedContent());
  }
});

// Handle messages from the main thread
self.addEventListener('message', event => {
  // Handle skip waiting message
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  
  // Handle cache warming for specific pages
  if (event.data && event.data.type === 'WARM_CACHE' && event.data.urls) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return Promise.all(
          event.data.urls.map(url => {
            return fetch(url, { cache: 'no-cache' })
              .then(response => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              })
              .catch(err => console.warn(`Failed to warm cache for ${url}`, err));
          })
        );
      })
    );
  }
});

// Function to sync data when back online
async function syncData() {
  const db = await openDB();
  const offlineData = await db.getAll('offlineData');
  
  // Process each saved offline data item
  const syncPromises = offlineData.map(async item => {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body
      });
      
      if (response.ok) {
        // Delete from the offline store once successfully synced
        await db.delete('offlineData', item.id);
      }
      return response.ok;
    } catch (error) {
      console.error('Failed to sync data:', error);
      return false;
    }
  });
  
  return Promise.all(syncPromises);
}

// Refresh frequently accessed content
async function refreshFrequentlyAccessedContent() {
  const frequentlyAccessedUrls = [
    'index.html',
    'css/styles.css',
    'js/script.js'
  ];
  
  const cache = await caches.open(CACHE_NAME);
  
  const refreshPromises = frequentlyAccessedUrls.map(url => {
    return fetch(url, { cache: 'no-cache' })
      .then(response => {
        if (response.ok) {
          return cache.put(url, response);
        }
        throw new Error(`Failed to refresh ${url}`);
      })
      .catch(err => console.warn(`Failed to refresh ${url}`, err));
  });
  
  return Promise.all(refreshPromises);
}

// Simple IndexedDB utility for storing offline data
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineDataDB', 1);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      db.createObjectStore('offlineData', { keyPath: 'id', autoIncrement: true });
      // Create additional store for analytics data that can be sent when back online
      db.createObjectStore('offlineAnalytics', { keyPath: 'id', autoIncrement: true });
    };
    
    request.onsuccess = event => {
      const db = event.target.result;
      resolve({
        getAll: storeName => {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        },
        delete: (storeName, id) => {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
        },
        add: (storeName, data) => {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        }
      });
    };
    
    request.onerror = event => {
      reject(event.target.error);
    };
  });
} 
