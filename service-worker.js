// Service Worker for caching and offline functionality
const CACHE_NAME = 'r2g-cache-v2';
const STATIC_ASSETS = [
  './',
  'index.html',
  'career-mode.html',
  'career-tournament.html',
  'manager-ranking.html',
  'registered-clubs.html',
  'trophy-cabinet.html',
  'tournament-guide.html',
  'offline.html',
  'css/styles.css',
  'css/critical.css',
  'js/script.js',
  'js/performance.js',
  'assets/images/logo11.webp'
];

// Cache critical resources during installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        // Cache each asset individually to allow the rest to continue if one fails
        return Promise.allSettled(
          STATIC_ASSETS.map(asset => 
            cache.add(asset).catch(error => {
              console.error(`Failed to cache asset: ${asset}`, error);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate and clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stale-while-revalidate strategy for all requests
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip requests for players.json as it might be large
  if (event.request.url.includes('players.json')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if available
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Cache new version if it's a successful response
            if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
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
            // If the network fails and we don't have a cached response, handle offline
            return caches.match('offline.html');
          });
          
        // Return the cached response or wait for network
        return cachedResponse || fetchPromise;
      })
  );
});

// Cache images using a separate cache with longer expiration
self.addEventListener('fetch', event => {
  // Only handle image requests
  if (event.request.destination === 'image') {
    // Special handling for club logos
    if (event.request.url.includes('/club/')) {
      event.respondWith(
        caches.open('club-logo-cache-v1')
          .then(cache => {
            return cache.match(event.request)
              .then(cachedResponse => {
                // Return cached response if available
                const fetchPromise = fetch(event.request)
                  .then(networkResponse => {
                    // Cache new version if it's a successful response
                    if (networkResponse && networkResponse.ok) {
                      cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                  })
                  .catch(err => {
                    console.log('Club logo fetch failed:', err);
                    
                    // Try alternative versions (handle -low.webp, .webp, .svg variations)
                    const url = new URL(event.request.url);
                    const path = url.pathname;
                    
                    // Extract the club name from the URL
                    const clubNameMatch = path.match(/\/club\/([^-\.]+)/);
                    if (clubNameMatch && clubNameMatch[1]) {
                      const clubName = clubNameMatch[1];
                      
                      // Try different formats in order
                      const formats = [
                        `assets/images/players/club/${clubName}.svg`,
                        `assets/images/players/club/${clubName}.webp`,
                        `assets/images/players/club/${clubName}-low.webp`
                      ];
                      
                      // Try each format
                      return Promise.any(
                        formats.map(format => 
                          fetch(format).catch(() => Promise.reject())
                        )
                      ).catch(() => {
                        // If all fail, use a fallback
                        return caches.match('assets/images/logo11.webp')
                          .catch(() => new Response('Not found', { status: 404 }));
                      });
                    }
                    
                    // Fallback to logo
                    return caches.match('assets/images/logo11.webp')
                      .catch(() => new Response('Not found', { status: 404 }));
                  });
                  
                // Return the cached response or wait for network
                return cachedResponse || fetchPromise;
              });
          })
      );
    } else {
      // Handle other image types
      event.respondWith(
        caches.open('image-cache-v1')
          .then(cache => {
            return cache.match(event.request)
              .then(cachedResponse => {
                // Return cached response if available
                const fetchPromise = fetch(event.request)
                  .then(networkResponse => {
                    // Cache new version if it's a successful response
                    if (networkResponse && networkResponse.ok) {
                      cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                  })
                  .catch(err => {
                    console.log('Image fetch failed:', err);
                    // Try to serve a fallback image
                    return caches.match('assets/images/logo11.webp')
                      .catch(() => new Response('Not found', { status: 404 }));
                  });
                  
                // Return the cached response or wait for network
                return cachedResponse || fetchPromise;
              });
          })
      );
    }
  }
});

// Background sync for saving data when offline
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Handle messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Function to sync data when back online
async function syncData() {
  const db = await openDB();
  const offlineData = await db.getAll('offlineData');
  
  // Process each saved offline data item
  for (const item of offlineData) {
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
    } catch (error) {
      console.error('Failed to sync data:', error);
    }
  }
}

// Simple IndexedDB utility for storing offline data
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineDataDB', 1);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      db.createObjectStore('offlineData', { keyPath: 'id', autoIncrement: true });
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
        }
      });
    };
    
    request.onerror = event => {
      reject(new Error('Failed to open IndexedDB'));
    };
  });
} 
