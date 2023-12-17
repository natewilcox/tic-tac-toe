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
    const isWindowFocused = clientList.some(client => client.visibilityState === 'visible' && client.focused);

    if (!isWindowFocused) {
        self.registration.showNotification(data.title, options);
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
  
    console.log('Notification click', event);
    
    // This looks to see if the current is already open and focuses if it is
    event.waitUntil((async () => {

      const clientList = await self.clients.matchAll({
            type: "window"
        });
    
        console.log('Client list', clientList);
        for (let client of clientList) {

            console.log('client url', client.url);
            if (client.url.includes('tic-tac-toe.natewilcox.io') && 'focus' in client) {

                console.log('client focus');
                return client.focus();
            }
        }
    
        if (self.clients.openWindow) {
            console.log('client open window');
            return self.clients.openWindow('/');
        }
    })());
});