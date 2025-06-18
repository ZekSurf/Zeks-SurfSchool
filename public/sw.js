// Service Worker for Push Notifications
const CACHE_NAME = 'zeks-surf-staff-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'New Surf Lesson Booked! 🏄‍♂️',
    body: 'A new lesson has been scheduled. Tap to view details.',
    icon: '/zek-surf-icon.ico',
    badge: '/zek-surf-icon.ico',
    tag: 'new-booking',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Booking',
        icon: '/images/surf-1.jpg'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: {
      url: '/staff-portal-a8f3e2b1c9d7e4f6',
      timestamp: Date.now()
    }
  };

  // If push has data, use it
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        title: pushData.title || notificationData.title,
        body: pushData.body || notificationData.body,
        data: {
          ...notificationData.data,
          ...pushData.data
        }
      };
    } catch (e) {
      console.error('Error parsing push data:', e);
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
      actions: notificationData.actions,
      data: notificationData.data,
      vibrate: [200, 100, 200], // iOS doesn't support vibration but doesn't hurt
      silent: false
    }
  );

  event.waitUntil(promiseChain);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Default action or 'view' action - open staff portal
  const urlToOpen = event.notification.data?.url || '/staff-portal-a8f3e2b1c9d7e4f6';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if staff portal is already open
      for (let client of clientList) {
        if (client.url.includes('staff-portal') && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If not open, open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-bookings') {
    console.log('Background sync triggered for bookings');
    // Could implement offline notification queueing here
  }
}); 