export async function requestPermissionForNotification() {

    if (Notification.permission !== 'denied') { 
        const permission = await Notification.requestPermission();
        console.info('Notification permission:', permission)
    }
}

export function sendNotification(title: string, body: string) {

    if (Notification.permission === "granted" && document.hidden) {

        var notification = new Notification(title, {
            body,
        });

        notification.onclick = function() {
            window.focus();
        };
    }
}

export async function createWebPushSubscription(publicKey: string) {

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
        console.warn('subscription already exists, unsubscribing');
        await subscription.unsubscribe();
    }

    console.log('creating subscription');
    subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    console.log('subscription=', JSON.stringify(subscription));
    const payload = JSON.stringify(subscription);
    
    console.log('payload=', payload);
    return payload;
}

function urlBase64ToUint8Array(base64String: string) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}