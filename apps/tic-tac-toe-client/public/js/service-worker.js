console.log("Service worker loaded...");
self.addEventListener('push', async event => {
    console.log("push event", event);

    const data = event.data.json();
    console.log('New notification', data);

    const options = {
        body: data.body,
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        icon: '../images/icon.png',
        badge: '../images/icon.png',
    };

    console.log('Notification options', options);

    const clientList = await self.clients.matchAll();
    if (clientList.some(client => client.visibilityState === 'visible')) {
        console.log('Not showing notification because the window is visible');
    } 
    else {
        event.waitUntil(self.registration.showNotification(data.title, options));
    }
});

self.addEventListener('install', function(event) {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', async function(event) {
    event.notification.close(); // Close the notification
  
    // This looks to see if the current is already open and focuses if it is
    event.waitUntil((async () => {

      const clientList = await self.clients.matchAll({
            type: "window"
        });
    
        for (let client of clientList) {
            if (client.url == '/?' && 'focus' in client) {
                return client.focus();
            }
        }
    
        if (self.clients.openWindow) {
            return self.clients.openWindow('/');
        }
    })());
  });