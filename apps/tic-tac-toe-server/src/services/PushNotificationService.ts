import * as webpush from 'web-push';

export class PushNotificationService {

    private static instance: PushNotificationService;
    private static vapidKeys: any;

    private constructor() {
    }

    public static getInstance(): PushNotificationService {

        if (!PushNotificationService.instance) {

            PushNotificationService.instance = new PushNotificationService();
            PushNotificationService.vapidKeys = webpush.generateVAPIDKeys();

            webpush.setVapidDetails(
                'mailto:natewilcox@gmail.com',
                PushNotificationService.vapidKeys.publicKey,
                PushNotificationService.vapidKeys.privateKey
            );
        }

        return PushNotificationService.instance;
    }

    publicKey() {
        return PushNotificationService.vapidKeys.publicKey;
    }

    async sendPush(subscription: any, title: string, body: string) {

      
        const payload = JSON.stringify({ title, body });

        try {
            console.log("sending notification")
            console.log('Subscription:', subscription);
            console.log('Payload:', payload);

            await webpush.sendNotification(subscription, payload)
        }
        catch (err: any) {

            console.log('Error message:', err.message);
            console.log('Status code:', err.statusCode);
            console.log('Stack trace:', err.stack);
        }
    }
}