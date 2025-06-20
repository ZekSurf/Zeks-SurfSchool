// Service Worker for Push Notifications and Background Sync
const CACHE_NAME = 'zeks-surf-staff-v2';
const STAFF_PORTAL_URL = '/staff-portal-a8f3e2b1c9d7e4f6';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    Promise.all([
      clients.claim(),
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification received:', event);
  
  let notificationData = {
    title: 'New Surf Lesson Booked!',
    body: 'A new lesson has been scheduled. Tap to view details.',
    icon: '/zek-surf-icon.ico',
    badge: '/zek-surf-icon.ico',
    tag: 'new-booking',
    requireInteraction: true,
    renotify: true,
    actions: [
      {
        action: 'view',
        title: '👀 View Details'
      },
      {
        action: 'dismiss',
        title: '✖️ Dismiss'
      }
    ],
    data: {
      url: STAFF_PORTAL_URL,
      timestamp: Date.now(),
      openStaffPortal: true
    }
  };

  // If push has data, use it
  if (event.data) {
    try {
      const pushData = event.data.json();
      // SECURITY: Removed push data logging - contains notification data
      
      notificationData = {
        ...notificationData,
        title: pushData.title || notificationData.title,
        body: pushData.body || notificationData.body,
        icon: pushData.icon || notificationData.icon,
        tag: pushData.tag || notificationData.tag,
        data: {
          ...notificationData.data,
          ...pushData.data,
          bookingInfo: {
            customerName: pushData.customerName,
            beach: pushData.beach,
            lessonDate: pushData.lessonDate,
            lessonTime: pushData.lessonTime,
            confirmationNumber: pushData.data?.confirmationNumber
          }
        }
      };
    } catch (e) {
      console.error('❌ Error parsing push data:', e);
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      renotify: notificationData.renotify,
      actions: notificationData.actions,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      silent: false,
      // iOS-specific properties
      sound: 'default'
    }
  );

  event.waitUntil(promiseChain);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    console.log('📝 Notification dismissed');
    return;
  }

  // Default action or 'view' action - open staff portal
  const urlToOpen = event.notification.data?.url || STAFF_PORTAL_URL;
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      console.log('🔍 Checking for existing staff portal windows:', clientList.length);
      
      // Check if staff portal is already open
      for (let client of clientList) {
        if (client.url.includes('staff-portal')) {
          console.log('✅ Found existing staff portal, focusing...');
          return client.focus().then(() => {
            // Send message to the client about the new booking
            if (event.notification.data?.bookingInfo) {
              client.postMessage({
                type: 'NEW_BOOKING_NOTIFICATION',
                booking: event.notification.data.bookingInfo
              });
            }
            return client;
          });
        }
      }
      
      // If not open, open new window
      console.log('🔄 Opening new staff portal window');
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    }).catch(error => {
      console.error('❌ Error handling notification click:', error);
    })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'staff-login-sync') {
    event.waitUntil(checkStaffLoginStatus());
  } else if (event.tag === 'booking-data-sync') {
    event.waitUntil(syncBookingData());
  }
});

// Message event for communication with main app
self.addEventListener('message', (event) => {
  // SECURITY: Removed message logging - may contain sensitive data
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'PERSIST_LOGIN') {
    // Store login session data for persistence
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.put('/staff-session', new Response(JSON.stringify({
          authenticated: true,
          timestamp: Date.now(),
          pin: event.data.pin // Only store temporarily for auto-login
        })));
      })
    );
  } else if (event.data && event.data.type === 'CHECK_SESSION') {
    // Check if user has valid session
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match('/staff-session').then(response => {
          if (response) {
            return response.json().then(sessionData => {
              // Check if session is still valid (24 hours)
              const isValid = Date.now() - sessionData.timestamp < (24 * 60 * 60 * 1000);
              event.ports[0].postMessage({
                hasValidSession: isValid,
                sessionData: isValid ? sessionData : null
              });
            });
          } else {
            event.ports[0].postMessage({
              hasValidSession: false,
              sessionData: null
            });
          }
        });
      })
    );
  }
});

// Helper function to check login status
async function checkStaffLoginStatus() {
  try {
    console.log('🔐 Checking staff login status...');
    // This could be expanded to validate session with server
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error checking login status:', error);
  }
}

// Helper function to sync booking data
async function syncBookingData() {
  try {
    // SECURITY: Removed sync logging - may contain booking data
    // This could fetch latest bookings when coming back online
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error syncing booking data:', error);
  }
}

// Fetch event for offline functionality
self.addEventListener('fetch', (event) => {
  // Only handle staff portal requests
  if (event.request.url.includes('staff-portal')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If offline, return cached version or offline page
        return caches.match(event.request).then(response => {
          return response || caches.match('/staff-portal-a8f3e2b1c9d7e4f6');
        });
      })
    );
  }
}); 