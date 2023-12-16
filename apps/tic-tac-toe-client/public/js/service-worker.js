console.log("Service worker loaded...");
self.addEventListener('push', event => {
    console.log("push event", event);

    const data = event.data.json();
    console.log('New notification', data);

    const options = {
      body: data.body,
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      //icon: 'images/notification-icon.png',
      //badge: 'images/notification-badge.png'
    };
  
    event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});